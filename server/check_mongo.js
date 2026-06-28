const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/ecocircle';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Successfully connected to local MongoDB.');
    
    // Define a simple Schema for Household to query the collection
    const HouseholdSchema = new mongoose.Schema({
      id: String,
      name: String,
      phone: String,
      address: String,
      ward: String,
      user_id: String,
      location: {
        type: { type: String },
        coordinates: [Number]
      }
    }, { collection: 'households' });
    
    const Household = mongoose.model('Household', HouseholdSchema);
    
    const households = await Household.find({}).lean();
    console.log(`Total households in MongoDB: ${households.length}`);
    if (households.length > 0) {
      console.log('Sample households from MongoDB:');
      households.slice(0, 5).forEach(h => {
        console.log(JSON.stringify(h));
      });
      
      // Let's print all household IDs to verify if they are H1..H45
      const ids = households.map(h => h.id).sort((a,b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      console.log('All household IDs in MongoDB:', ids.join(', '));
    } else {
      console.log('No households found in MongoDB.');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
