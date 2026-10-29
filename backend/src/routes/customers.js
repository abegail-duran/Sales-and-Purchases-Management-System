const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', authorize('admin', 'manager', 'cashier'), customerController.createCustomer);
router.put('/:id', authorize('admin', 'manager', 'cashier'), customerController.updateCustomer);
router.delete('/:id', authorize('admin', 'manager'), customerController.deleteCustomer);

module.exports = router;
