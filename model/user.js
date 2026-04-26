const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'recruiter', 'coach', 'admin'],
    default: 'jobseeker'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'active'   // jobseekers are active immediately
  },
  shortlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }]
}, { timestamps: true });


// HASH PASSWORD BEFORE SAVING
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);

});

// helper for login password check
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", userSchema);

module.exports = User;