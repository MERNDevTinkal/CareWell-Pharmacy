require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminAuthRoutes = require('./routes/adminAuth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const brandRoutes = require('./routes/brand.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const reviewRoutes = require('./routes/review.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const cmsRoutes = require('./routes/cms.routes');
const homepageRoutes = require('./routes/homepage.routes');
const settingsRoutes = require('./routes/settings.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const customerRoutes = require('./routes/customer.routes');
const contactRoutes = require('./routes/contact.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const couponRoutes = require('./routes/coupon.routes');
const mediaRoutes = require('./routes/media.routes');
const adminUserRoutes = require('./routes/adminUser.routes');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'https://care-well-pharmacy.vercel.app',
  'https://admin-care-well-pharmacy.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
}));

// Body & Cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize inputs
app.use(mongoSanitize());

// Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Uploads static directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const connectDB = require('./config/db');

// Ensure DB connected on serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), app: 'CareWell Pharmacy API' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/homepage', homepageRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/customers', customerRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/admin-users', adminUserRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
