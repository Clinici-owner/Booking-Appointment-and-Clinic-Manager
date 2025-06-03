const User = require("../models/User");
const bcrypt = require("bcrypt");

class userController {
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

module.exports = new userController();
