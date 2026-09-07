const express = require('express');
const productController = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Público — catálogo
router.get('/', productController.list);
router.get('/:code', productController.getByCode);

// Admin — gestão
router.post('/', authMiddleware, requireRole('admin', 'employee'), productController.create);
router.put('/:id', authMiddleware, requireRole('admin', 'employee'), productController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), productController.remove);

module.exports = router;
