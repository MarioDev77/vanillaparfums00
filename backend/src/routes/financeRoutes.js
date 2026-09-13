const express = require('express');
const financeController = require('../controllers/financeController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware, requireRole('admin', 'employee'));

router.get('/summary', financeController.summary);
router.get('/monthly', financeController.monthly);
router.get('/receivables', financeController.receivables);
router.get('/export/pdf', financeController.exportPdf);

module.exports = router;
