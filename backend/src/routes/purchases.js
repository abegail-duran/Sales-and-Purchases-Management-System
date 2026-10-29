const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchase);
router.post('/', authorize('admin', 'manager', 'inventory_staff'), purchaseController.createPurchase);
router.post('/:id/receive', authorize('admin', 'manager', 'inventory_staff'), purchaseController.receivePurchase);

module.exports = router;
