const express = require('express');
const recruiterRouter = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const Resume = require('../model/resume');
const User = require('../model/user');

/* ── Recruiter-only middleware ── */
const requireRecruiter = (req, res, next) => {
  if (!['recruiter', 'coach', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Recruiter access required' });
  }
  if (req.user?.status !== 'active') {
    return res.status(403).json({ message: 'Your account is pending approval.' });
  }
  next();
};

recruiterRouter.use(requireAuth, requireRecruiter);


/* ── GET /api/recruiter/resumes
   Browse all job seeker resumes with optional filters
   Query params: search, skills, industry, template
   ── */
recruiterRouter.get('/resumes', async (req, res) => {
  try {
    const { search, skills, template, page = 1, limit = 12 } = req.query;

    // Build pipeline
    const matchStage = {};

    if (template) matchStage.templateName = template;

    // skills filter — check if any skill keyword appears in skills field
    if (skills) {
      matchStage.skills = { $regex: skills, $options: 'i' };
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Resume.countDocuments(matchStage);

    const resumes = await Resume.find(matchStage)
      .populate('userId', 'firstName lastName email role')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    return res.json({
      resumes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
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


/* ── Shortlist model (in-memory per recruiter via a simple sub-doc approach)
   We store shortlists on the User model — add a shortlist field if not present,
   or use a separate collection. Here we use a lightweight approach:
   PATCH /api/recruiter/shortlist/:resumeId  — toggle shortlist
   GET  /api/recruiter/shortlist             — get my shortlist
── */
recruiterRouter.patch('/shortlist/:resumeId', async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { resumeId } = req.params;

    const recruiter = await User.findById(recruiterId);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    // Ensure shortlist array exists
    if (!recruiter.shortlist) recruiter.shortlist = [];

    const idx = recruiter.shortlist.findIndex(id => id.toString() === resumeId);
    let action;
    if (idx === -1) {
      recruiter.shortlist.push(resumeId);
      action = 'added';
    } else {
      recruiter.shortlist.splice(idx, 1);
      action = 'removed';
    }

    await recruiter.save();
    return res.json({ message: `Shortlist ${action}`, shortlist: recruiter.shortlist });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


recruiterRouter.get('/shortlist', async (req, res) => {
  try {
    const recruiter = await User.findById(req.user._id).select('shortlist');
    if (!recruiter?.shortlist?.length) return res.json({ resumes: [] });

    const resumes = await Resume.find({ _id: { $in: recruiter.shortlist } })
      .populate('userId', 'firstName lastName email')
      .select('-__v');

    return res.json({ resumes });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = recruiterRouter;
