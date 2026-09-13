const express = require('express');
const manualSaleController = require('../controllers/manualSaleController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware, requireRole('admin', 'employee'));

router.get('/stats/summary', manualSaleController.stats);
router.get('/export', manualSaleController.exportCsv);
router.get('/', manualSaleController.list);
router.post('/', manualSaleController.create);
router.put('/:id', manualSaleController.update);
router.delete('/:id', manualSaleController.remove);

module.exports = router;
