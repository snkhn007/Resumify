const express = require('express');
const resumeRouter = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const Resume = require('../model/resume');

// All resume routes require authentication
resumeRouter.use(requireAuth);

// POST /api/resumes — save or update a resume
resumeRouter.post('/', async (req, res) => {
  try {
    const {
      resumeId, title, templateName,
      fullName, tagline, phone, email, linkedin,
      github,                                     // ← added
      summary, skills, experience,
      projects,                                   // ← added
      education
    } = req.body;

    // If resumeId provided, update existing
    if (resumeId) {
      const existing = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!existing) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      Object.assign(existing, {
        title, templateName,
        fullName, tagline, phone, email, linkedin,
        github,                                   // ← added
        summary, skills, experience,
        projects,                                 // ← added
        education
      });
      await existing.save();
      return res.status(200).json({ message: 'Resume updated', resume: existing });
    }

    // Create new resume
    const resume = await Resume.create({
      userId: req.user._id,
      title: title || `${fullName || 'My'} Resume`,
      templateName: templateName || 'Classic',
      fullName, tagline, phone, email, linkedin,
      github,                                     // ← added
      summary, skills, experience,
      projects,                                   // ← added
      education
    });

    return res.status(201).json({ message: 'Resume saved', resume });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/resumes — get all resumes for logged-in user
resumeRouter.get('/', async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('_id title templateName fullName updatedAt createdAt');
    return res.status(200).json({ resumes });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/resumes/:id — get single resume
resumeRouter.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.status(200).json({ resume });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/resumes/:id — delete a resume
resumeRouter.delete('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.status(200).json({ message: 'Resume deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = resumeRouter;