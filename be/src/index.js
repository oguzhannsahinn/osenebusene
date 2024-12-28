const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const goalRoutes = require('./routes/goal.routes');
const categoryRoutes = require('./routes/category.routes');
const { authenticateToken } = require('./middleware/auth');
const { corsMiddleware } = require('./config/firebase');

const app = express();

// Middleware
app.use(cors());
app.use(corsMiddleware);
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', authenticateToken, goalRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir şeyler ters gitti!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 