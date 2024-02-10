const {check}=require('express-validator')
const Validator = require('../Middlewares/Validator')

exports.Validate_Create_User=[
      check('name').notEmpty().withMessage('UserName name is required')
                       .isLength({min:3}).withMessage('User name is too short')
                       .isLength({max:30}).withMessage('User name is too long'),
  
      check('lastname').notEmpty().withMessage(' lastName is required'),
  
      check('email').notEmpty().withMessage('email is required'),
                      
  
      check('password').notEmpty().withMessage('password  is required')
                      .isLength({min:6}).withMessage('password is too short'),
                      
      Validator
  
  ]

