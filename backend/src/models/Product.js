const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  selling_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  current_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  maximum_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'pcs'
  },
  expiration_tracking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiration_date: {
    type: DataTypes.DATE
  },
  image: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;
