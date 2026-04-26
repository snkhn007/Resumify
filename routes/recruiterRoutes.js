const express = require('express');
const recruiterRouter = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const Resume = require('../model/resume');
const User = require('../model/user');

/* ── Recruiter-only middleware ── */
const requireRecruiter = async (req, res, next) => {
  try {
    if (!['recruiter', 'coach', 'admin'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Recruiter access required' });
    }
    const user = await User.findById(req.user._id).select('status');
    if (!user || user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is pending approval.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

recruiterRouter.use(requireAuth, requireRecruiter);


/* ── GET /api/recruiter/resumes
   Browse all job seeker resumes with optional filters.
   Query params: search, skill (singular — matches frontend), template, page, limit
── */
recruiterRouter.get('/resumes', async (req, res) => {
  try {
    // FIX 1: frontend sends 'skill' (singular) — was 'skills' before, caused filter mismatch
    const { search, skill, template, page = 1, limit = 9 } = req.query;

    // Only show resumes belonging to jobseekers (not other recruiters/admins)
    const jobseekerIds = await User.find({ role: 'jobseeker', status: 'active' }).distinct('_id');
    const matchStage = { userId: { $in: jobseekerIds } };

    // FIX 2: template filter is case-insensitive regex so "Classic" matches "classic" etc.
    if (template) {
      matchStage.templateName = { $regex: `^${template}$`, $options: 'i' };
    }

    // skill filter — matches anywhere in the comma-separated skills string
    if (skill) {
      matchStage.skills = { $regex: skill, $options: 'i' };
    }

    // text search across name, tagline, summary, skills
    if (search) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { tagline:  { $regex: search, $options: 'i' } },
        { summary:  { $regex: search, $options: 'i' } },
        { skills:   { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [resumes, total] = await Promise.all([
      Resume.find(matchStage)
        .populate('userId', 'firstName lastName email role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Resume.countDocuments(matchStage)
    ]);

    return res.json({
      resumes,
      pagination: {
        total,
        page:  pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('GET /resumes error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ── GET /api/recruiter/resumes/:id — full resume detail ── */
recruiterRouter.get('/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('userId', 'firstName lastName email');
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.json({ resume });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ── PATCH /api/recruiter/shortlist/:resumeId — toggle shortlist ── */
recruiterRouter.patch('/shortlist/:resumeId', async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { resumeId } = req.params;

    // FIX 3: Use $addToSet / $pull atomic operators instead of .save()
    // This avoids the shortlist field being silently dropped if it's not
    // defined in the User schema (Mongoose ignores unknown fields on save).
    const recruiter = await User.findById(recruiterId).select('shortlist');
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const shortlist = recruiter.shortlist || [];
    const alreadySaved = shortlist.some(id => id.toString() === resumeId);

    let updatedUser;
    if (alreadySaved) {
      // Remove from shortlist
      updatedUser = await User.findByIdAndUpdate(
        recruiterId,
        { $pull: { shortlist: resumeId } },
        { new: true }
      ).select('shortlist');
      return res.json({ message: 'Shortlist removed', shortlist: updatedUser.shortlist });
    } else {
      // Add to shortlist
      updatedUser = await User.findByIdAndUpdate(
        recruiterId,
        { $addToSet: { shortlist: resumeId } },
        { new: true }
      ).select('shortlist');
      return res.json({ message: 'Shortlist added', shortlist: updatedUser.shortlist });
    }
  } catch (err) {
    console.error('PATCH /shortlist error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ── GET /api/recruiter/shortlist — get this recruiter's shortlisted resumes ── */
recruiterRouter.get('/shortlist', async (req, res) => {
  try {
    const recruiter = await User.findById(req.user._id).select('shortlist');
    if (!recruiter?.shortlist?.length) return res.json({ resumes: [] });

    const resumes = await Resume.find({ _id: { $in: recruiter.shortlist } })
      .populate('userId', 'firstName lastName email')
      .select('-__v');

    return res.json({ resumes });
  } catch (err) {
    console.error('GET /shortlist error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = recruiterRouter;
