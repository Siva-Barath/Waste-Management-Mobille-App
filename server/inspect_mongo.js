const mongoose = require('mongoose');

async function main() {
  const uri = "mongodb://localhost:27017/ecocircle";
  
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB via Mongoose successfully!");
    const db = mongoose.connection.db;

    // 1. Check households collection
    const householdsColl = db.collection("households");
    const households = await householdsColl.find({}).toArray();
    console.log(`\nMongoDB households count: ${households.length}`);
    if (households.length > 0) {
      console.log("MongoDB Households sample (H1..H45 check):");
      const sorted = households.sort((a,b) => {
        const numA = parseInt(String(a.id || '').replace(/\D/g, '')) || 0;
        const numB = parseInt(String(b.id || '').replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      
      sorted.forEach((h, idx) => {
        if (idx < 5 || idx > sorted.length - 6) {
          console.log(`  Household: ID=${h.id} Name=${h.name} Phone=${h.phone} Ward=${h.ward || h.zone} Lat=${h.lat} Lng=${h.lng}`);
        } else if (idx === 5) {
          console.log("  ...");
        }
      });
    }

    // 2. Check users collection
    const usersColl = db.collection("users");
    const users = await usersColl.find({}).toArray();
    console.log(`\nMongoDB users count: ${users.length}`);
    if (users.length > 0) {
      console.log("MongoDB Users sample:");
      users.slice(0, 10).forEach(u => {
        console.log(`  User: ID=${u.id} Username=${u.username} Role=${u.role} Phone=${u.phone}`);
      });
    }

  } catch (e) {
    console.error("Error connecting or querying MongoDB:", e);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch(console.error);
