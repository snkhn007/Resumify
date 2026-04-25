const mongoose = require("mongoose");
 
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
 
  if (!uri) {
    console.error("FATAL ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
  }
 
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
 
module.exports = connectDB;