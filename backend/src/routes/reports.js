const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/sales', reportController.getSalesReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/purchases', reportController.getPurchaseReport);
router.get('/financial-summary', reportController.getFinancialSummary);
router.get('/product-sales', reportController.getProductSalesReport);

module.exports = router;
