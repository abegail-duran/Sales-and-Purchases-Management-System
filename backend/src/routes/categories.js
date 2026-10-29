const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', authorize('admin', 'manager'), categoryController.createCategory);
router.put('/:id', authorize('admin', 'manager'), categoryController.updateCategory);
router.delete('/:id', authorize('admin', 'manager'), categoryController.deleteCategory);

module.exports = router;
