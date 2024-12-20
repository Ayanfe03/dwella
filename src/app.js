const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('../routes/v1/userRoutes');
const apartmentRoutes = require('../routes/v1/apartmentRoutes');
const adminRoutes = require('../routes/v1/adminRoutes');

app.use(cors());
app.use(express.json());
app.use('/v1/users', userRoutes);
app.use('/v1/apartments', apartmentRoutes);
app.use('/v1/admin', adminRoutes);


module.exports = app;
