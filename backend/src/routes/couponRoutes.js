const express = require('express');
const couponController = require('../controllers/couponController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/validate/:code', couponController.validate);
router.get('/', authMiddleware, requireRole('admin'), couponController.list);
router.post('/', authMiddleware, requireRole('admin'), couponController.create);
router.put('/:id', authMiddleware, requireRole('admin'), couponController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), couponController.remove);

module.exports = router;
