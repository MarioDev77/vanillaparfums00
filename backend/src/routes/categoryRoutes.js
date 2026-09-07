const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', categoryController.list);
router.post('/', authMiddleware, requireRole('admin'), categoryController.create);
router.put('/:id', authMiddleware, requireRole('admin'), categoryController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), categoryController.remove);

module.exports = router;
