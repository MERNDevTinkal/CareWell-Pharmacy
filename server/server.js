require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`CareWell Pharmacy Backend API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
    });
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
