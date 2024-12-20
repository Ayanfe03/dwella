const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('../routes/v1/userRoutes');
const apartmentRoutes = require('../routes/v1/apartmentRoutes');

app.use(cors());
app.use(express.json());
app.use('/v1/users', userRoutes);
app.use('/v1/apartments', apartmentRoutes);

module.exports = app;
