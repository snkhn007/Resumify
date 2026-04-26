require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

// Database
const connectDB = require('./config/db');
connectDB();

// Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const pageRouter   = require('./routes/pageRoutes');
const authRouter   = require('./routes/authRoutes');
const resumeRouter = require('./routes/resumeRoutes');
const atsRouter = require('./routes/atsRoutes');
const adminRouter = require('./routes/adminRoutes');
const recruiterRouter = require('./routes/recruiterRoutes');

app.use('/api/recruiter', recruiterRouter);
app.use('/api/admin', adminRouter);
app.use('/user',        pageRouter);
app.use('/api/auth',    authRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ats', atsRouter);

// Root redirect → /user/
app.get('/', (req, res) => res.redirect('/user/'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { user: null });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Resumify running on http://localhost:${PORT}`);
});