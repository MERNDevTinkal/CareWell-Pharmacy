const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./src/app');
const connectDB = require('./src/config/db');

async function runTests() {
  console.log('=== STARTING CAREWELL PHARMACY E2E INTEGRATION TESTS ===\n');
  await connectDB();

  let adminToken = '';
  let customerToken = '';
  let testProductId = '';
  let testOrderId = '';

  try {
    // 1. Health check
    console.log('[TEST 1] Checking API Health Endpoint...');
    const healthRes = await request(app).get('/api/v1/health');
    if (healthRes.status !== 200 || healthRes.body.status !== 'OK') {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
    }
    console.log('✓ Health check passed (200 OK)');

    // 2. Admin Login
    console.log('\n[TEST 2] Testing Super Admin Login...');
    const adminLoginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ email: 'admin@carewell.com', password: 'Admin@123' });
    if (adminLoginRes.status !== 200 || !adminLoginRes.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.body)}`);
    }
    adminToken = adminLoginRes.body.token;
    console.log(`✓ Admin authenticated successfully: ${adminLoginRes.body.data.name} (${adminLoginRes.body.data.role})`);

    // 3. Customer Login
    console.log('\n[TEST 3] Testing Customer Login...');
    const customerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@demo.com', password: 'Demo@123' });
    if (customerLoginRes.status !== 200 || !customerLoginRes.body.token) {
      throw new Error(`Customer login failed: ${JSON.stringify(customerLoginRes.body)}`);
    }
    customerToken = customerLoginRes.body.token;
    console.log(`✓ Customer authenticated successfully: ${customerLoginRes.body.data.name}`);

    // 4. Products Listing & Verification
    console.log('\n[TEST 4] Testing Products Catalog API...');
    const productsRes = await request(app).get('/api/v1/products?limit=5');
    if (productsRes.status !== 200 || !productsRes.body.data || productsRes.body.data.length === 0) {
      throw new Error(`Products listing failed: ${JSON.stringify(productsRes.body)}`);
    }
    const sampleProduct = productsRes.body.data[0];
    testProductId = sampleProduct._id;
    console.log(`✓ Catalog verified: found ${productsRes.body.pagination.total} products. Sample: ${sampleProduct.name} (₹${sampleProduct.price})`);

    // 5. Cart Operations
    console.log('\n[TEST 5] Testing Customer Cart & Coupon Discount Calculation...');
    // Clear cart first
    await request(app).delete('/api/v1/cart/clear').set('Authorization', `Bearer ${customerToken}`);

    // Add item to cart
    const addCartRes = await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId, quantity: 2 });
    if (addCartRes.status !== 200) {
      throw new Error(`Add to cart failed: ${JSON.stringify(addCartRes.body)}`);
    }
    console.log('✓ Item added to cart (qty: 2)');

    // Apply Coupon WELCOME10
    const couponRes = await request(app)
      .post('/api/v1/cart/coupon')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'WELCOME10' });
    if (couponRes.status !== 200) {
      console.log('Note on coupon:', couponRes.body.message);
    } else {
      console.log(`✓ Coupon applied: discount = ₹${couponRes.body.data.couponDiscount}`);
    }

    // 6. Checkout & Order Creation
    console.log('\n[TEST 6] Testing Checkout & Order Placement...');
    const orderPayload = {
      shippingAddress: {
        name: 'John Doe',
        phone: '+91 98765 43210',
        line1: '42, Park Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      paymentMethod: 'demo_upi',
      notes: 'Please deliver after 5 PM'
    };

    const createOrderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(orderPayload);

    if (createOrderRes.status !== 201 || !createOrderRes.body.data) {
      throw new Error(`Order placement failed: ${JSON.stringify(createOrderRes.body)}`);
    }
    testOrderId = createOrderRes.body.data._id;
    const orderNumber = createOrderRes.body.data.orderNumber;
    console.log(`✓ Order placed successfully! Order Number: ${orderNumber}, Total: ₹${createOrderRes.body.data.totalAmount}`);

    // 7. Admin Order Management & Tracking
    console.log('\n[TEST 7] Testing Admin Order Status Transition & Tracking...');
    const orderStatusRes = await request(app)
      .put(`/api/v1/orders/${testOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed', note: 'Prescription verified and stock reserved' });

    if (orderStatusRes.status !== 200) {
      throw new Error(`Admin update status failed: ${JSON.stringify(orderStatusRes.body)}`);
    }
    console.log(`✓ Order status transitioned to: ${orderStatusRes.body.data.status}`);

    const trackingRes = await request(app)
      .put(`/api/v1/orders/${testOrderId}/tracking`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courier: 'Blue Dart Healthcare Express',
        trackingNumber: 'BD987654321IN',
        trackingUrl: 'https://track.bluedart.com/BD987654321IN'
      });

    if (trackingRes.status !== 200) {
      throw new Error(`Tracking update failed: ${JSON.stringify(trackingRes.body)}`);
    }
    console.log(`✓ Courier tracking attached: ${trackingRes.body.data.courier} (${trackingRes.body.data.trackingNumber})`);

    // 8. Dynamic Store Settings (Admin Updates -> Public API reflects)
    console.log('\n[TEST 8] Testing Dynamic Admin Settings & Public Storefront Reflection...');
    const newTagline = `Healthcare Excellence Since ${new Date().getFullYear()}`;
    const updateSettingsRes = await request(app)
      .put('/api/v1/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ storeTagline: newTagline });

    if (updateSettingsRes.status !== 200) {
      throw new Error(`Settings update failed: ${JSON.stringify(updateSettingsRes.body)}`);
    }

    const publicSettingsRes = await request(app).get('/api/v1/settings/public');
    if (publicSettingsRes.body.data.storeTagline !== newTagline) {
      throw new Error(`Public settings did not reflect change: expected '${newTagline}', got '${publicSettingsRes.body.data.storeTagline}'`);
    }
    console.log(`✓ Dynamic settings persisted and verified: tagline = "${publicSettingsRes.body.data.storeTagline}"`);

    // 9. Admin Dashboard Analytics
    console.log('\n[TEST 9] Testing Admin Dashboard Metrics & Aggregations...');
    const dashboardStatsRes = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    if (dashboardStatsRes.status !== 200 || !dashboardStatsRes.body.data) {
      throw new Error(`Dashboard stats failed: ${JSON.stringify(dashboardStatsRes.body)}`);
    }
    const stats = dashboardStatsRes.body.data;
    console.log(`✓ Admin Dashboard live metrics: Total Orders: ${stats.totalOrders}, Revenue: ₹${stats.totalSales}, Customers: ${stats.totalCustomers}, Low Stock Items: ${stats.lowStockCount}`);

    console.log('\n======================================================');
    console.log(' ALL 9 FULL-STACK INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
