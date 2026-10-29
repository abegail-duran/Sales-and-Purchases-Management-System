const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const sequelize = require('../backend/src/config/database');
const {
  User,
  Category,
  Supplier,
  Product,
  Customer,
  Setting
} = require('../backend/src/models');

const seed = async () => {
  try {
    console.log('Starting Sales & Purchases database seeding...');

    // Create users
    console.log('Creating users...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@estrellafoodhub.com',
      password: 'admin123',
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      phone: '09123456789',
      status: 'active'
    });

    const manager = await User.create({
      username: 'manager',
      email: 'manager@estrellafoodhub.com',
      password: 'manager123',
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      role: 'manager',
      phone: '09234567890',
      status: 'active'
    });

    const cashier = await User.create({
      username: 'cashier',
      email: 'cashier@estrellafoodhub.com',
      password: 'cashier123',
      first_name: 'Maria',
      last_name: 'Santos',
      role: 'cashier',
      phone: '09345678901',
      status: 'active'
    });

    const inventoryStaff = await User.create({
      username: 'inventory',
      email: 'inventory@estrellafoodhub.com',
      password: 'inventory123',
      first_name: 'Pedro',
      last_name: 'Reyes',
      role: 'inventory_staff',
      phone: '09456789012',
      status: 'active'
    });

    console.log('✓ Users created');

    // Create categories
    console.log('Creating categories...');
    const categories = await Category.bulkCreate([
      { name: 'Food', description: 'Food products', status: 'active' },
      { name: 'Beverages', description: 'Drinks and beverages', status: 'active' },
      { name: 'Snacks', description: 'Snack items', status: 'active' },
      { name: 'Frozen Products', description: 'Frozen food items', status: 'active' },
      { name: 'Grocery', description: 'Grocery items', status: 'active' },
      { name: 'Others', description: 'Other products', status: 'active' }
    ]);

    console.log('✓ Categories created');

    // Create suppliers
    console.log('Creating suppliers...');
    const suppliers = await Supplier.bulkCreate([
      {
        name: 'Manila Food Distributors',
        contact_person: 'Roberto Garcia',
        phone: '02-1234-5678',
        email: 'info@manilafoods.com',
        address: '123 Quezon Avenue, Quezon City',
        status: 'active'
      },
      {
        name: 'Fresh Harvest Supplies',
        contact_person: 'Elena Rodriguez',
        phone: '02-2345-6789',
        email: 'sales@freshharvest.com',
        address: '456 Rizal Street, Makati City',
        status: 'active'
      },
      {
        name: 'Metro Beverages Inc',
        contact_person: 'Carlos Mendoza',
        phone: '02-3456-7890',
        email: 'orders@metrobev.com',
        address: '789 Taft Avenue, Manila',
        status: 'active'
      },
      {
        name: 'Golden Snacks Trading',
        contact_person: 'Ana Lim',
        phone: '02-4567-8901',
        email: 'contact@goldensnacks.com',
        address: '321 Ortigas Avenue, Pasig City',
        status: 'active'
      },
      {
        name: 'Frozen Foods Express',
        contact_person: 'Miguel Santos',
        phone: '02-5678-9012',
        email: 'info@frozenexpress.com',
        address: '654 EDSA, Mandaluyong City',
        status: 'active'
      }
    ]);

    console.log('✓ Suppliers created');

    // Create products
    console.log('Creating products...');
    await Product.bulkCreate([
      // Food items
      {
        sku: 'FOOD-001',
        barcode: '1234567890001',
        name: 'Chicken Burger',
        description: 'Delicious chicken burger',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        cost_price: 35.00,
        selling_price: 65.00,
        current_stock: 50,
        minimum_stock: 20,
        maximum_stock: 200,
        unit: 'pcs',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'FOOD-002',
        barcode: '1234567890002',
        name: 'Beef Tapa',
        description: 'Marinated beef tapa',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        cost_price: 80.00,
        selling_price: 120.00,
        current_stock: 40,
        minimum_stock: 15,
        maximum_stock: 150,
        unit: 'pcs',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'FOOD-003',
        barcode: '1234567890003',
        name: 'Pork Tocino',
        description: 'Sweet cured pork tocino',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        cost_price: 75.00,
        selling_price: 115.00,
        current_stock: 35,
        minimum_stock: 15,
        maximum_stock: 150,
        unit: 'pcs',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'BEV-001',
        barcode: '1234567890004',
        name: 'Iced Coffee 500ml',
        description: 'Freshly brewed iced coffee',
        category_id: categories[1].id,
        supplier_id: suppliers[2].id,
        cost_price: 25.00,
        selling_price: 50.00,
        current_stock: 80,
        minimum_stock: 30,
        maximum_stock: 300,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'BEV-002',
        barcode: '1234567890005',
        name: 'Mineral Water 500ml',
        description: 'Purified drinking water',
        category_id: categories[1].id,
        supplier_id: suppliers[2].id,
        cost_price: 10.00,
        selling_price: 20.00,
        current_stock: 120,
        minimum_stock: 50,
        maximum_stock: 500,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'SNK-001',
        barcode: '1234567890006',
        name: 'Potato Chips BBQ 100g',
        description: 'Crispy barbecue potato chips',
        category_id: categories[2].id,
        supplier_id: suppliers[3].id,
        cost_price: 30.00,
        selling_price: 55.00,
        current_stock: 60,
        minimum_stock: 20,
        maximum_stock: 200,
        unit: 'pack',
        status: 'active'
      },
      {
        sku: 'FRZ-001',
        barcode: '1234567890007',
        name: 'Frozen Chicken Nuggets 500g',
        description: 'Ready to fry chicken nuggets',
        category_id: categories[3].id,
        supplier_id: suppliers[4].id,
        cost_price: 90.00,
        selling_price: 140.00,
        current_stock: 25,
        minimum_stock: 10,
        maximum_stock: 100,
        unit: 'pack',
        status: 'active'
      },
      {
        sku: 'GRC-001',
        barcode: '1234567890016',
        name: 'Rice 5kg',
        description: 'Premium rice 5 kilograms',
        category_id: categories[4].id,
        supplier_id: suppliers[1].id,
        cost_price: 180.00,
        selling_price: 250.00,
        current_stock: 40,
        minimum_stock: 15,
        maximum_stock: 150,
        unit: 'pack',
        status: 'active'
      }
    ]);

    console.log('✓ Products created');

    // Create default walk-in customer
    console.log('Creating default customer...');
    await Customer.create({
      customer_id: 'CUST-000001',
      name: 'Walk-in Customer',
      phone: 'N/A',
      email: null,
      address: null,
      status: 'active'
    });

    console.log('✓ Default customer created');

    // Create system settings
    console.log('Creating system settings...');
    await Setting.bulkCreate([
      {
        key: 'business_name',
        value: 'ESTRELLA FOOD HUB',
        description: 'Business name'
      },
      {
        key: 'system_module',
        value: 'Sales and Purchases Management System',
        description: 'System Module Name'
      },
      {
        key: 'business_address',
        value: '123 Main Street, City, Province',
        description: 'Business address'
      },
      {
        key: 'business_phone',
        value: '09123456789',
        description: 'Business phone number'
      },
      {
        key: 'business_email',
        value: 'info@estrellafoodhub.com',
        description: 'Business email'
      },
      {
        key: 'currency',
        value: 'PHP',
        description: 'Currency code'
      },
      {
        key: 'currency_symbol',
        value: '₱',
        description: 'Currency symbol'
      }
    ]);

    console.log('✓ Settings created');

    console.log('\n========================================');
    console.log('✓ Sales & Purchases Seeding completed successfully!');
    console.log('========================================\n');
    console.log('Test Accounts:');
    console.log('----------------------------');
    console.log('Admin:       username: admin     password: admin123');
    console.log('Manager:     username: manager   password: manager123');
    console.log('Cashier:     username: cashier   password: cashier123');
    console.log('Inventory:   username: inventory password: inventory123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
