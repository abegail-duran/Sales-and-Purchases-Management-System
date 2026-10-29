const sequelize = require('../config/database');
const { Sale, SaleItem, Purchase, PurchaseItem, Product, Category, User, Supplier } = require('../models');
const { Op } = require('sequelize');

exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, cashier_id, payment_method } = req.query;
    
    const where = {
      status: 'completed'
    };
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    if (cashier_id) {
      where.cashier_id = cashier_id;
    }
    
    if (payment_method) {
      where.payment_method = payment_method;
    }

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: User, as: 'cashier', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + parseFloat(sale.discount), 0);
    const totalTransactions = sales.length;

    res.json({
      success: true,
      data: {
        sales,
        summary: {
          totalSales: totalSales.toFixed(2),
          totalDiscount: totalDiscount.toFixed(2),
          netSales: (totalSales - totalDiscount).toFixed(2),
          totalTransactions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const { category_id, status } = req.query;
    
    const where = {};
    
    if (category_id) {
      where.category_id = category_id;
    }
    
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + (parseFloat(product.cost_price) * product.current_stock);
    }, 0);

    const totalRetailValue = products.reduce((sum, product) => {
      return sum + (parseFloat(product.selling_price) * product.current_stock);
    }, 0);

    const lowStockCount = products.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0).length;
    const outOfStockCount = products.filter(p => p.current_stock === 0).length;

    res.json({
      success: true,
      data: {
        products,
        summary: {
          totalProducts: products.length,
          totalInventoryValue: totalInventoryValue.toFixed(2),
          totalRetailValue: totalRetailValue.toFixed(2),
          potentialProfit: (totalRetailValue - totalInventoryValue).toFixed(2),
          lowStockCount,
          outOfStockCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

exports.getPurchaseReport = async (req, res) => {
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
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['purchase_date', 'DESC']]
    });

    const totalPurchases = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total_cost), 0);
    const totalTransactions = purchases.length;

    res.json({
      success: true,
      data: {
        purchases,
        summary: {
          totalPurchases: totalPurchases.toFixed(2),
          totalTransactions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate purchase report',
      error: error.message
    });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const dateFilter = {};
    
    if (start_date && end_date) {
      dateFilter.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Calculate gross sales
    const salesData = await Sale.findAll({
      where: {
        ...dateFilter,
        status: 'completed'
      }
    });

    const grossSales = salesData.reduce((sum, sale) => sum + parseFloat(sale.subtotal), 0);
    const totalDiscount = salesData.reduce((sum, sale) => sum + parseFloat(sale.discount), 0);
    const netSales = grossSales - totalDiscount;

    // Calculate COGS (Cost of Goods Sold)
    const saleItems = await SaleItem.findAll({
      include: [
        {
          model: Sale,
          as: 'sale',
          where: {
            ...dateFilter,
            status: 'completed'
          }
        },
        {
          model: Product,
          as: 'product',
          attributes: ['cost_price']
        }
      ]
    });

    const cogs = saleItems.reduce((sum, item) => {
      const cost = item.product ? parseFloat(item.product.cost_price) : 0;
      return sum + (cost * item.quantity);
    }, 0);

    const grossProfit = netSales - cogs;

    res.json({
      success: true,
      data: {
        grossSales: grossSales.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        netSales: netSales.toFixed(2),
        costOfGoodsSold: cogs.toFixed(2),
        grossProfit: grossProfit.toFixed(2),
        grossProfitMargin: netSales > 0 ? ((grossProfit / netSales) * 100).toFixed(2) : '0.00',
        totalExpenses: '0.00',
        netIncome: grossProfit.toFixed(2),
        netProfitMargin: netSales > 0 ? ((grossProfit / netSales) * 100).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial summary',
      error: error.message
    });
  }
};

exports.getProductSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, limit = 50 } = req.query;
    
    const dateFilter = {};
    if (start_date && end_date) {
      dateFilter.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const productSales = await SaleItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_sales'],
        [sequelize.fn('COUNT', sequelize.col('SaleItem.id')), 'transaction_count']
      ],
      include: [
        {
          model: Sale,
          as: 'sale',
          where: {
            ...dateFilter,
            status: 'completed'
          },
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'cost_price', 'selling_price'],
          include: [
            { model: Category, as: 'category', attributes: ['id', 'name'] }
          ]
        }
      ],
      group: ['product_id'],
      order: [[sequelize.fn('SUM', sequelize.col('subtotal')), 'DESC']],
      limit: parseInt(limit, 10),
      raw: false
    });

    res.json({
      success: true,
      data: productSales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate product sales report',
      error: error.message
    });
  }
};
