const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', productController.getAllProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', productController.getProduct);
router.post('/', authorize('admin', 'manager'), productController.createProduct);
router.put('/:id', authorize('admin', 'manager'), productController.updateProduct);
router.delete('/:id', authorize('admin', 'manager'), productController.deleteProduct);

module.exports = router;
