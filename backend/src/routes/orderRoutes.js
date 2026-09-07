const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Público — checkout
router.post('/', orderController.create);

// Admin — gestão de pedidos
router.get('/', authMiddleware, requireRole('admin', 'employee'), orderController.list);
router.get('/:id', authMiddleware, requireRole('admin', 'employee'), orderController.getById);
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('admin', 'employee'),
  orderController.updateStatus
);

module.exports = router;
