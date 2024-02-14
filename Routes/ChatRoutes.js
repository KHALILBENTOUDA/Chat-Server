const express = require("express");
const ChatController = require("../Controller/ChatController");
const route = express.Router();

route.route('/').post(ChatController.creatChat)
route.route('/:user_id').get(ChatController.userChat)
route.route('/find/:first_id/:second_id').get(ChatController.findChat)


module.exports = route  