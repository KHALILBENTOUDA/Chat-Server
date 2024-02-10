const express = require("express");
const EmageController = require("../Controller/EmageController");
const uploadFunction = require("../Util/UploadEmages");
const route = express.Router();


const uploadProfile=uploadFunction('Users','user')
const uploadCover=uploadFunction('Covers','cover')
const uploadpost=uploadFunction('Posts','post')



route.route('/profileEmage/:id').put(uploadProfile.single('pictures'),EmageController.editProfile);
route.route('/profileCover/:id').put(uploadCover.single('pictures'),EmageController.editCover);
route.route('/postEmage/:id').post(uploadpost.single('pictures'),EmageController.insertPostEmage);
route.route('/getposts/:id').get(EmageController.getAppPostsEmages);


module.exports = route