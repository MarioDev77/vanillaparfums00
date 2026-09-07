const express = require('express');
const { login, me } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { loginRateLimit } = require('../middlewares/loginRateLimit');

const router = express.Router();

router.post('/login', loginRateLimit, login);
router.get('/me', authMiddleware, me);

module.exports = router;
