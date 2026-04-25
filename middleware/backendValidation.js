const { body } = require('express-validator');

const signupValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 3 }).withMessage('First name must be at least 3 characters'),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 3 }).withMessage('Last name must be at least 3 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = {
  signupValidation,
  loginValidation
};