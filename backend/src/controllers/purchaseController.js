const sequelize = require('../config/database');
const { Purchase, PurchaseItem, Product, Supplier, User, InventoryMovement } = require('../models');
const { logActivity } = require('../utils/activityLogger');
const { generatePurchaseNumber } = require('../utils/generateNumber');
const { Op } = require('sequelize');

exports.createPurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { supplier_id, items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No items in purchase order'
      });
    }

    if (!supplier_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Supplier is required'
      });
    }

    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Calculate total cost and validate items
    let totalCost = 0;
    const itemsToCreate = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      const costPrice = parseFloat(item.cost_price);

      if (!quantity || quantity <= 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid purchase item quantity'
        });
      }

      if (isNaN(costPrice) || costPrice < 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid purchase cost price'
        });
      }

      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product_id}`
        });
      }

      const subtotal = costPrice * quantity;
      totalCost += subtotal;

      itemsToCreate.push({
        product_id: item.product_id,
        quantity,
        cost_price: costPrice,
        subtotal,
        batch_number: item.batch_number || null,
        expiration_date: item.expiration_date || null
      });
    }

    // Create purchase
    const purchaseNumber = generatePurchaseNumber();
    const purchase = await Purchase.create({
      purchase_number: purchaseNumber,
      supplier_id,
      user_id: req.user.id,
      purchase_date: new Date(),
      total_cost: totalCost,
      status: 'pending',
      notes
    }, { transaction: t });

    // Create purchase items
    for (const item of itemsToCreate) {
      await PurchaseItem.create({
        purchase_id: purchase.id,
        ...item
      }, { transaction: t });
    }

    await t.commit();

    await logActivity(
      req.user.id,
      'Create Purchase',
      'Purchases',
      purchase.id,
      `Created purchase order ${purchaseNumber}`,
      req.ip
    );

    const completePurchase = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: completePurchase
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase',
      error: error.message
    });
  }
};

exports.receivePurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{ model: PurchaseItem, as: 'items' }],
      transaction: t
    });

    if (!purchase) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    if (purchase.status === 'received') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase order has already been received'
      });
    }

    if (purchase.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cancelled purchase order cannot be received'
      });
    }

    // Update inventory for each item
    for (const item of purchase.items) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ID ${item.product_id} no longer exists`
        });
      }

      // Update stock and cost price
      const updatedFields = {
        current_stock: product.current_stock + item.quantity,
        cost_price: item.cost_price
      };

      // Update expiration if product tracks expiration and item has an expiration date
      if (item.expiration_date && product.expiration_tracking) {
        updatedFields.expiration_date = item.expiration_date;
      }

      await product.update(updatedFields, { transaction: t });

      // Create inventory movement record
      await InventoryMovement.create({
        product_id: item.product_id,
        type: 'in',
        quantity: item.quantity,
        reference_type: 'purchase',
        reference_id: purchase.id,
        user_id: req.user.id,
        notes: `Purchase: ${purchase.purchase_number}`
      }, { transaction: t });
    }

    await purchase.update({ status: 'received' }, { transaction: t });

    await t.commit();

    await logActivity(
      req.user.id,
      'Receive Purchase',
      'Purchases',
      purchase.id,
      `Received purchase order ${purchase.purchase_number}`,
      req.ip
    );

    const updatedPurchase = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Purchase received successfully and inventory updated',
      data: updatedPurchase
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to receive purchase',
      error: error.message
    });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const { start_date, end_date, supplier_id, status } = req.query;
    
    const where = {};
    
    if (start_date && end_date) {
      where.purchase_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    if (supplier_id) {
      where.supplier_id = supplier_id;
    }
    
    if (status) {
      where.status = status;
    }

    const purchases = await Purchase.findAll({
      where,
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }]
        },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
};

exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase',
      error: error.message
    });
  }
};
