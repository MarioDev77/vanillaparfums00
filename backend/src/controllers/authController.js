const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  registerFailedAttempt,
  registerSuccessfulAttempt,
} = require('../middlewares/loginRateLimit');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, active FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !user.active) {
      registerFailedAttempt(req.ip);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      registerFailedAttempt(req.ip);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    registerSuccessfulAttempt(req.ip);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { login, me };
