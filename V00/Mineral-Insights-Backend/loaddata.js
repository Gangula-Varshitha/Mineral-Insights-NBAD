const mongoose = require('mongoose');
const csvtojson = require('csvtojson');
require('dotenv').config();


// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB on DigitalOcean'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Define a schema for the collection
const MineralSchema = new mongoose.Schema({
  Entity: String,
  Code: String,
  Year: Number,
  ShareOfGlobalProduction: Number,
});

// Create a model for the collection
const Mineral = mongoose.model("Mineral", MineralSchema);

// Path to your CSV file
const csvFilePath = "./data/data.csv";

// Convert CSV to JSON and upload to MongoDB
csvtojson()
  .fromFile(csvFilePath)
  .then(async (jsonArray) => {
    try {
      // Preprocess the JSON array
      const processedData = jsonArray.map((row) => ({
        Entity: row['Entity'],
        Code: row['Code'],
        Year: parseInt(row['Year'], 10),
        ShareOfGlobalProduction: parseFloat(row['share of global production|Bauxite|Mine|tonnes']),
      }));

      const batchSize = 500; // Insert in smaller batches
      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        await Mineral.insertMany(batch);
        console.log(`Batch ${i / batchSize + 1} inserted successfully`);
      }

      console.log("Data successfully uploaded to MongoDB");
    } catch (error) {
      console.error("Error uploading data:", error);
    } finally {
      mongoose.connection.close(); // Close the connection after upload
    }
  })
  .catch((error) => {
    console.error("Error reading CSV file:", error);
  });
