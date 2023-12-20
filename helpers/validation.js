const { check } = require('express-validator');

exports.signUpValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid Email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'Password is required').isLength({min:6})
];
exports.loginValidation = [
    check('email', 'Please enter a valid Email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'min 6 length').isLength({min:6})
];


exports.forgetValidation = [
    check('email', 'Please enter a valid Email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    
];