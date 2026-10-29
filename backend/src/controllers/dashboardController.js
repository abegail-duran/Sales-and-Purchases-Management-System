const sequelize = require('../config/database');
const { Sale, SaleItem, Product, Category, Customer, User, Purchase } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySalesData = await Sale.findAll({
      where: {
        created_at: {
          [Op.between]: [today, tomorrow]
        },
        status: 'completed'
      }
    });

    const todaysSales = todaySalesData.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const todaysTransactions = todaySalesData.length;

    // Today's purchases
    const todayPurchasesData = await Purchase.findAll({
      where: {
        created_at: {
          [Op.between]: [today, tomorrow]
        },
        status: {
          [Op.in]: ['pending', 'received']
        }
      }
    });
    const todaysPurchases = todayPurchasesData.reduce((sum, p) => sum + parseFloat(p.total_cost), 0);

    // Total products
    const totalProducts = await Product.count({
      where: { status: 'active' }
    });

    // Total inventory value
    const products = await Product.findAll({
      where: { status: 'active' },
      attributes: ['current_stock', 'cost_price']
    });
    
    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + (parseFloat(product.cost_price) * product.current_stock);
    }, 0);

    // Low stock items
    const lowStockItems = await Product.count({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.col('current_stock'),
            '<=',
            sequelize.col('minimum_stock')
          ),
          { current_stock: { [Op.gt]: 0 } },
          { status: 'active' }
        ]
      }
    });

    // Out of stock items
    const outOfStockItems = await Product.count({
      where: {
        current_stock: 0,
        status: 'active'
      }
    });

    // Net sales
    const netSales = todaysSales;

    res.json({
      success: true,
      data: {
        todaysSales: todaysSales.toFixed(2),
        todaysTransactions,
        totalProducts,
        totalInventoryValue: totalInventoryValue.toFixed(2),
        lowStockItems,
        outOfStockItems,
        todaysPurchases: todaysPurchases.toFixed(2),
        netSales: netSales.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    let dateFormat;
    let daysBack;

    if (period === 'daily') {
      dateFormat = '%Y-%m-%d';
      daysBack = 7;
    } else if (period === 'weekly') {
      dateFormat = '%Y-%u';
      daysBack = 56;
    } else {
      dateFormat = '%Y-%m';
      daysBack = 180;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const salesData = await Sale.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales chart data',
      error: error.message
    });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await SaleItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_sales']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'selling_price']
        }
      ],
      group: ['product_id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: parseInt(limit, 10),
      raw: false
    });

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top selling products',
      error: error.message
    });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const transactions = await Sale.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10)
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent transactions',
      error: error.message
    });
  }
};

exports.getSalesByCategory = async (req, res) => {
  try {
    const salesByCategory = await SaleItem.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_sales']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: [],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      group: ['product.category.id'],
      raw: false
    });

    res.json({
      success: true,
      data: salesByCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales by category',
      error: error.message
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const lowStockProducts = await Product.findAll({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.col('current_stock'),
            '<=',
            sequelize.col('minimum_stock')
          ),
          { status: 'active' }
        ]
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['current_stock', 'ASC']],
      limit: parseInt(limit, 10)
    });

    res.json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
};
