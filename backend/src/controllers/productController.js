const sequelize = require('../config/database');
const { Product, Category, Supplier } = require('../models');
const { logActivity } = require('../utils/activityLogger');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category_id, status } = req.query;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (category_id) {
      where.category_id = category_id;
    }
    
    if (status) {
      where.status = status;
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    const product = await Product.create(productData);

    await logActivity(
      req.user.id,
      'Create Product',
      'Products',
      product.id,
      `Created product: ${product.name}`,
      req.ip
    );

    const newProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update(req.body);

    await logActivity(
      req.user.id,
      'Update Product',
      'Products',
      product.id,
      `Updated product: ${product.name}`,
      req.ip
    );

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update({ status: 'inactive' });

    await logActivity(
      req.user.id,
      'Delete Product',
      'Products',
      product.id,
      `Deactivated product: ${product.name}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        current_stock: {
          [Op.lte]: sequelize.col('minimum_stock')
        },
        status: 'active'
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
};
