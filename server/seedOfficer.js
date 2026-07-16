require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedOfficer = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'officer@resoly.com';
    const existingOfficer = await User.findOne({ email });

    if (existingOfficer) {
      console.log('Officer account already exists.');
    } else {
      await User.create({
        name: 'Officer',
        email: email,
        password: '12345678', // The pre-save hook will hash this using bcrypt
        role: 'officer'
      });
      console.log('Officer account successfully created!');
    }
  } catch (error) {
    console.error('Error seeding officer:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedOfficer();
