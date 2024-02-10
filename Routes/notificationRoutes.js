const express = require("express");

const notificationController = require("../Controller/notificationController");
const route = express.Router();

route.route('/').post(notificationController.createNotification)
route.route('/getAll').post(notificationController.getNotifications)
route.route('/isread').post(notificationController.isReadnotification)
// route.route('/:user_id').get(ChatController.userChat)
// route.route('/find/:first_id/:second_id').get(ChatController.findChat)


module.exports = route  