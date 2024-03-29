const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   GET api/auth
// @desc Test Route
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth
// @desc Authenticate User & Get Token
// @access Public
router.post('/', [
    check('email', 'Please enter valid email').isEmail(),
    check('password', 'Please enter a password ').exists()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        try {
            
            // See if user exists
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }
            
            //  Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {
                expiresIn: 3600000
            }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
            
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }

});

module.exports = router;