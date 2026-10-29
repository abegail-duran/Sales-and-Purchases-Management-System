const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const sequelize = require('../backend/src/config/database');
const models = require('../backend/src/models');

const migrate = async () => {
  try {
    console.log('Starting Sales & Purchases database migration...');

    // Synchronize all models
    await sequelize.sync({ force: true });

    console.log('✓ Database migration completed successfully');
    console.log('✓ All tables created:');
    console.log('  - users');
    console.log('  - categories');
    console.log('  - suppliers');
    console.log('  - products');
    console.log('  - customers');
    console.log('  - sales');
    console.log('  - sale_items');
    console.log('  - purchases');
    console.log('  - purchase_items');
    console.log('  - inventory_movements');
    console.log('  - activity_logs');
    console.log('  - settings');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
