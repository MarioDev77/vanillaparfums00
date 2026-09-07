const express = require('express');
const stockController = require('../controllers/stockController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware, requireRole('admin', 'employee'));

router.get('/', stockController.overview);
router.get('/movements/:productId', stockController.movementsByProduct);
router.post('/movements', stockController.createMovement);

module.exports = router;
