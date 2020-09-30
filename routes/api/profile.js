const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
con

// @route   GET api/profile/me
// @desc Get Current Users Profile
// @access private
router.get('/', auth, async (req, res) => {
    
});

module.exports = router;