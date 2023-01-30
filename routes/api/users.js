const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//user model
const User = require('../../models/User');
//use bcryption
const bcrypt = require('bcryptjs');
//
const jwt = require('jsonwebtoken');
//
const config = require('config');

// @route POST api/users
// @desc  user register 
// @access Public

router.post('/', [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'email should be correct').isEmail(),
    check('password', 'password must be at least 8 characters,contains uppercase,numbers and special charachter')
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors });
        }

        const { name, email, password } = req.body;

        try {
            // see if user exist
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'user already exist' }] });
            }
            //create instace of user
            user = new User({
                name,
                email,
                password
            });
            //Encrypt password 
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            //Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });


module.exports = router;
