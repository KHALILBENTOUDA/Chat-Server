const express = require("express");
const IntrestControlle = require("../Controller/IntrestControlle");
const route = express.Router();

route.route('/').get(IntrestControlle.getAllInterests)


module.exports = route