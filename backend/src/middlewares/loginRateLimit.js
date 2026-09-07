// Bloqueio progressivo por IP: 5 tentativas -> bloqueio de 15min, dobrando até 24h.
const attempts = new Map(); // ip -> { count, blockedUntil, lockMinutes }

const BASE_ATTEMPTS = 5;
const BASE_LOCK_MINUTES = 15;
const MAX_LOCK_MINUTES = 24 * 60;

function getEntry(ip) {
  if (!attempts.has(ip)) {
    attempts.set(ip, { count: 0, blockedUntil: null, lockMinutes: BASE_LOCK_MINUTES });
  }
  return attempts.get(ip);
}

function loginRateLimit(req, res, next) {
  const ip = req.ip;
  const entry = getEntry(ip);

  if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
    const minutesLeft = Math.ceil((entry.blockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      error: `Muitas tentativas. Tente novamente em ${minutesLeft} minuto(s).`,
    });
  }

  next();
}

function registerFailedAttempt(ip) {
  const entry = getEntry(ip);
  entry.count += 1;

  if (entry.count >= BASE_ATTEMPTS) {
    entry.blockedUntil = Date.now() + entry.lockMinutes * 60000;
    entry.lockMinutes = Math.min(entry.lockMinutes * 2, MAX_LOCK_MINUTES);
    entry.count = 0;
  }
}

function registerSuccessfulAttempt(ip) {
  attempts.delete(ip);
}

module.exports = { loginRateLimit, registerFailedAttempt, registerSuccessfulAttempt };
