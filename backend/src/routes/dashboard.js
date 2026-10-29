const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-chart', dashboardController.getSalesChart);
router.get('/top-products', dashboardController.getTopSellingProducts);
router.get('/recent-transactions', dashboardController.getRecentTransactions);
router.get('/sales-by-category', dashboardController.getSalesByCategory);
router.get('/low-stock', dashboardController.getLowStockProducts);

module.exports = router;
