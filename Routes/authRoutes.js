const express = require("express");
const AuthController = require("../Controller/AuthController");
const uploadFunction = require("../Util/UploadEmages");
const { Validate_Create_User } = require("../Util/ValidateUser");
const route = express.Router();



const upload=uploadFunction('Users','user')


route.route('/register').post(Validate_Create_User,AuthController.register);
route.route('/login').post(AuthController.login);
route.route('/logout').get(AuthController.logout);
route.route('/compalte_profile/:id').post(upload.single('pictures'),AuthController.ComplateProfile);
route.route('/userInterest/:id').post(AuthController.Interests);
route.route('/:id/verify/:token').get(AuthController.VerifyToken);
route.route('/resetpassword').post(AuthController.resetpassword);
route.route('/updatepassword').post(AuthController.updatepassword);
route.route('/update/:id').put(AuthController.updateUserprofile);

module.exports = route