const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({

  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true
  },

  title: {
    type:    String,
    default: 'My Resume',
    trim:    true
  },

  templateName: {
    type:    String,
    default: 'Classic'
  },

  /* ----- Header ----- */
  fullName: { type: String, default: '' },
  tagline:  { type: String, default: '' },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github:   { type: String, default: '' },

  /* ----- Body ----- */
  summary: { type: String, default: '' },
  skills:  { type: String, default: '' },

  experience: [
    {
      title:   String,
      company: String,
      start:   String,
      end:     String,
      desc:    String
    }
  ],

  education: [
    {
      degree:    String,
      institute: String,
      start:     String,
      end:       String,
      desc:      String
    }
  ],

  projects: [
    {
      name: String,
      tech: String,
      link: String,
      desc: String
    }
  ]

}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;