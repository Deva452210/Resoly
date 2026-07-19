require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect(process.env.MONGO_URI).then(async () => { 
  const users = await User.find({ role: { $in: ['officer', 'authority'] } }); 
  console.log(users.map(u => ({ email: u.email, role: u.role }))); 
  process.exit(0); 
});
