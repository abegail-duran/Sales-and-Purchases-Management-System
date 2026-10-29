const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', saleController.getAllSales);
router.get('/:id', saleController.getSale);
router.post('/', authorize('admin', 'manager', 'cashier'), saleController.createSale);
router.post('/:id/void', authorize('admin', 'manager'), saleController.voidSale);

module.exports = router;
