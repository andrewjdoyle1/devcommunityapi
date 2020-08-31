const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../modules/User');
// route get api/users
// register user
//access public
router.post(
  '/',
  [
    body('name', 'Please enter your name').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { name, email, password } = req.body;
    // deconstruct the values from the req.body
    const errors = validationResult(req);
    console.log(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // if error return the error array
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      //if user return the error message in the same json structure
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      // gravatar criteria
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // creates a new user in an object

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      // hashed the password
      await user.save();
      res.json('User registered');
    } catch (error) {
      console.log(error.message);
      res.status(500).json('server error');
    }
  }
);

module.exports = router;
