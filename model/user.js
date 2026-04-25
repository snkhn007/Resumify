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
  }
}, { timestamps: true });


// HASH PASSWORD BEFORE SAVING
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);

});
// userSchema.pre("save", async function(next) {
//   if (!this.isModified("password")) {
//     return next();
//   }

//   try {
//     const saltRounds = 10;
//     this.password = await bcrypt.hash(this.password, saltRounds);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });


// helper for login password check
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", userSchema);

module.exports = User;