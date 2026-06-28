const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/ecocircle';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Successfully connected to local MongoDB.');
    
    // Define a simple Schema for User to query the collection
    const UserSchema = new mongoose.Schema({
      id: String,
      name: String,
      phone: String,
      email: String,
      role: String,
      zone: String,
      created_at: Date
    }, { collection: 'users' });
    
    const User = mongoose.model('User', UserSchema);
    
    const users = await User.find({}).lean();
    console.log(`Total users in MongoDB: ${users.length}`);
    if (users.length > 0) {
      console.log('Sample users from MongoDB:');
      users.forEach(u => {
        console.log(JSON.stringify(u));
      });
    } else {
      console.log('No users found in MongoDB.');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
