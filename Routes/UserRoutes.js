const express = require("express");
const UserController= require("../Controller/UserController");
const LoginVerify = require("../Middlewares/LoginVerify");
const route = express.Router();

route.route('/currentUser').get(LoginVerify,UserController.GetCurrentUser);
route.route('/all').get(LoginVerify,UserController.getAllusers);
route.route('/:id').get(LoginVerify,UserController.getUser);
route.route('/like').put(UserController.likeUsers);
route.route('/unlike').put(UserController.unlikeUsers);
route.route('/getlikes').post(UserController.fetchLikes);
route.route('/chowinputchat').post(UserController.likeshowInput);
route.route('/search').post(UserController.search);

module.exports = route  