const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./src/server');
const http = require('http');

let server;
const PORT = 5099;

const request = async (method, endpoint, token = null, body = null) => {
  const url = `http://127.0.0.1:${PORT}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
};

const runTests = async () => {
  console.log('====================================================');
  console.log('TESTING SALES AND PURCHASES MANAGEMENT SYSTEM BACKEND');
  console.log('====================================================\n');

  let adminToken = '';
  let cashierToken = '';
  let chickenBurgerId = null;
  let supplierId = null;
  let testSaleId = null;
  let testPurchaseId = null;
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('1. Health Check:');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data?.success === true, 'API is running and healthy');

    // 2. Authentication
    console.log('\n2. Authentication:');
    const adminLogin = await request('POST', '/api/auth/login', null, {
      username: 'admin',
      password: 'admin123'
    });
    assert(adminLogin.status === 200 && adminLogin.data?.data?.token, 'Admin login successful');
    adminToken = adminLogin.data?.data?.token;

    const cashierLogin = await request('POST', '/api/auth/login', null, {
      username: 'cashier',
      password: 'cashier123'
    });
    assert(cashierLogin.status === 200 && cashierLogin.data?.data?.token, 'Cashier login successful');
    cashierToken = cashierLogin.data?.data?.token;

    const profileRes = await request('GET', '/api/auth/profile', cashierToken);
    assert(profileRes.status === 200 && profileRes.data?.data?.username === 'cashier', 'Cashier profile verified');

    // 3. Products & Stock Inspection
    console.log('\n3. Products & POS Setup:');
    const productsRes = await request('GET', '/api/products', cashierToken);
    assert(productsRes.status === 200 && productsRes.data?.data?.length > 0, 'Products retrieved for POS');
    
    const burger = productsRes.data.data.find(p => p.sku === 'FOOD-001');
    assert(burger !== undefined, 'Found Chicken Burger (FOOD-001)');
    chickenBurgerId = burger.id;
    const initialBurgerStock = burger.current_stock;
    console.log(`     Initial stock of Chicken Burger: ${initialBurgerStock}`);

    const suppliersRes = await request('GET', '/api/suppliers', adminToken);
    assert(suppliersRes.status === 200 && suppliersRes.data?.data?.length > 0, 'Suppliers list retrieved');
    supplierId = suppliersRes.data.data[0].id;

    // 4. Dashboard Stats
    console.log('\n4. Dashboard Stats:');
    const statsRes = await request('GET', '/api/dashboard/stats', adminToken);
    assert(statsRes.status === 200 && statsRes.data?.data?.totalProducts > 0, 'Dashboard statistics loaded');
    const chartRes = await request('GET', '/api/dashboard/sales-chart?period=daily', adminToken);
    assert(chartRes.status === 200 && Array.isArray(chartRes.data?.data), 'Daily sales chart loaded');

    // 5. POS Sale Creation & Inventory Deduction
    console.log('\n5. POS Sale Creation & Inventory Deduction:');
    const salePayload = {
      items: [
        { product_id: chickenBurgerId, quantity: 3 }
      ],
      payment_method: 'cash',
      amount_received: 200.00,
      discount: 0,
      tax: 0
    };

    const saleRes = await request('POST', '/api/sales', cashierToken, salePayload);
    assert(saleRes.status === 201 && saleRes.data?.data?.transaction_number, 'Sale created successfully');
    testSaleId = saleRes.data?.data?.id;
    const saleTotal = parseFloat(saleRes.data?.data?.total);
    const changeAmount = parseFloat(saleRes.data?.data?.change_amount);
    assert(saleTotal === 195.00, `Sale total computed correctly (3 * ₱65 = ₱${saleTotal})`);
    assert(changeAmount === 5.00, `Change computed correctly (₱200 - ₱195 = ₱${changeAmount})`);

    // Verify stock decreased by 3
    const productAfterSale = await request('GET', `/api/products/${chickenBurgerId}`, cashierToken);
    const stockAfterSale = productAfterSale.data?.data?.current_stock;
    assert(stockAfterSale === initialBurgerStock - 3, `Product stock decreased by 3: was ${initialBurgerStock}, now ${stockAfterSale}`);

    // 6. Authorized Sale Voiding & Stock Restoration
    console.log('\n6. Sale Voiding & Stock Restoration:');
    const voidRes = await request('POST', `/api/sales/${testSaleId}/void`, adminToken);
    assert(voidRes.status === 200 && voidRes.data?.success === true, 'Sale voided successfully');

    // Verify stock restored
    const productAfterVoid = await request('GET', `/api/products/${chickenBurgerId}`, cashierToken);
    const stockAfterVoid = productAfterVoid.data?.data?.current_stock;
    assert(stockAfterVoid === initialBurgerStock, `Product stock restored back to ${stockAfterVoid}`);

    // Verify duplicate void rejected
    const duplicateVoid = await request('POST', `/api/sales/${testSaleId}/void`, adminToken);
    assert(duplicateVoid.status === 400, 'Duplicate void rejected with HTTP 400');

    // 7. Purchase Order Creation & Receiving
    console.log('\n7. Purchase Order & Stock Receiving:');
    const purchasePayload = {
      supplier_id: supplierId,
      items: [
        { product_id: chickenBurgerId, quantity: 15, cost_price: 35.00 }
      ],
      notes: 'Test PO for restocking'
    };

    const createPORes = await request('POST', '/api/purchases', adminToken, purchasePayload);
    assert(createPORes.status === 201 && createPORes.data?.data?.purchase_number, 'Purchase order created with status pending');
    testPurchaseId = createPORes.data?.data?.id;
    const poTotal = parseFloat(createPORes.data?.data?.total_cost);
    assert(poTotal === 525.00, `Purchase total computed correctly (15 * ₱35 = ₱${poTotal})`);

    // Stock should not change before receiving
    const stockBeforeReceive = (await request('GET', `/api/products/${chickenBurgerId}`, adminToken)).data?.data?.current_stock;
    assert(stockBeforeReceive === initialBurgerStock, `Stock remains unchanged before receiving (${stockBeforeReceive})`);

    // Receive purchase order
    const receiveRes = await request('POST', `/api/purchases/${testPurchaseId}/receive`, adminToken);
    assert(receiveRes.status === 200 && receiveRes.data?.data?.status === 'received', 'Purchase order received successfully');

    // Stock should increase by 15 exactly once
    const stockAfterReceive = (await request('GET', `/api/products/${chickenBurgerId}`, adminToken)).data?.data?.current_stock;
    assert(stockAfterReceive === initialBurgerStock + 15, `Stock increased by 15: was ${initialBurgerStock}, now ${stockAfterReceive}`);

    // Prevent duplicate receive
    const duplicateReceive = await request('POST', `/api/purchases/${testPurchaseId}/receive`, adminToken);
    assert(duplicateReceive.status === 400, 'Duplicate purchase receiving prevented with HTTP 400');

    const stockAfterDuplicate = (await request('GET', `/api/products/${chickenBurgerId}`, adminToken)).data?.data?.current_stock;
    assert(stockAfterDuplicate === initialBurgerStock + 15, 'Stock did not increase on duplicate receive attempt');

    // 8. Validation and Edge Cases
    console.log('\n8. Validation & Edge Cases:');
    // Insufficient stock
    const overStockSale = await request('POST', '/api/sales', cashierToken, {
      items: [{ product_id: chickenBurgerId, quantity: 99999 }],
      payment_method: 'cash',
      amount_received: 1000000
    });
    assert(overStockSale.status === 400, 'Sale rejected when quantity exceeds available stock');

    // Empty cart
    const emptyCartSale = await request('POST', '/api/sales', cashierToken, {
      items: [],
      payment_method: 'cash',
      amount_received: 100
    });
    assert(emptyCartSale.status === 400, 'Sale rejected for empty cart');

    // Invalid payment amount
    const underpaidSale = await request('POST', '/api/sales', cashierToken, {
      items: [{ product_id: chickenBurgerId, quantity: 1 }],
      payment_method: 'cash',
      amount_received: 10 // item is 65
    });
    assert(underpaidSale.status === 400, 'Sale rejected when amount received is less than total');

    // 9. History & Reports Endpoints
    console.log('\n9. Sales & Purchases History and Reports:');
    const salesList = await request('GET', '/api/sales', adminToken);
    assert(salesList.status === 200 && Array.isArray(salesList.data?.data), 'Sales history endpoint functioning');

    const purchasesList = await request('GET', '/api/purchases', adminToken);
    assert(purchasesList.status === 200 && Array.isArray(purchasesList.data?.data), 'Purchases history endpoint functioning');

    const salesReport = await request('GET', '/api/reports/sales', adminToken);
    assert(salesReport.status === 200 && salesReport.data?.data?.summary, 'Sales report generated with summary');

    const purchaseReport = await request('GET', '/api/reports/purchases', adminToken);
    assert(purchaseReport.status === 200 && purchaseReport.data?.data?.summary, 'Purchase report generated with summary');

    const inventoryReport = await request('GET', '/api/reports/inventory', adminToken);
    assert(inventoryReport.status === 200 && inventoryReport.data?.data?.summary, 'Inventory valuation report generated');

    const financialSummary = await request('GET', '/api/reports/financial-summary', adminToken);
    assert(financialSummary.status === 200 && financialSummary.data?.data?.grossSales !== undefined, 'Financial summary report generated');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
};

server = http.createServer(app);
server.listen(PORT, async () => {
  await runTests();
});
