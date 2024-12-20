const { Sequelize } = require('sequelize');
const config = require('./config/config');


const sequelize = new Sequelize(config.production.url, {
  host: config.production.host,
  port: config.production.port,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully!');

  } catch (error) {
    console.log(`❌ Unable to connect to the database: ${error}`);
  }
})();

module.exports = sequelize;