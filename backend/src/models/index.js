const User = require('./User');
const Category = require('./Category');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Customer = require('./Customer');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const InventoryMovement = require('./InventoryMovement');
const ActivityLog = require('./ActivityLog');
const Setting = require('./Setting');

// Define associations

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });

// Sale associations
Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Sale.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });
Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });

// SaleItem associations
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(SaleItem, { foreignKey: 'product_id', as: 'sale_items' });

// Purchase associations
Purchase.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Purchase.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id', as: 'items' });
Supplier.hasMany(Purchase, { foreignKey: 'supplier_id', as: 'purchases' });

// PurchaseItem associations
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id', as: 'purchase' });
PurchaseItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(PurchaseItem, { foreignKey: 'product_id', as: 'purchase_items' });

// InventoryMovement associations
InventoryMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
InventoryMovement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Product.hasMany(InventoryMovement, { foreignKey: 'product_id', as: 'movements' });

// ActivityLog associations
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activity_logs' });

module.exports = {
  User,
  Category,
  Supplier,
  Product,
  Customer,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  InventoryMovement,
  ActivityLog,
  Setting
};
