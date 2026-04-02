const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');
const { User } = require('./models');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existingAdmin = await User.findOne({ where: { email: 'admin@momato.in' } });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@momato.in',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@momato.in');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
