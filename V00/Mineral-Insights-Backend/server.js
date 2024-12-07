const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const jwt = require('jsonwebtoken'); // Import JWT
const cors = require('cors');
const bcrypt = require('bcryptjs');
const compression = require('compression');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Import Nodemailer
const secretkey = "mineral-insights-nbad";
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB on DigitalOcean'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  });
  
  // Define a schema for the collection
  const MineralSchema = new mongoose.Schema({
    Entity: String,
    Code: String,
    Year: Number,
    ShareOfGlobalProduction: Number
  });


// Hash password before saving it to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10); // generate a salt
    this.password = await bcrypt.hash(this.password, salt); // hash password
    next();
  } catch (err) {
    next(err);
  }
});
  
  // Create a model for the collection
  const Mineral = mongoose.model("Mineral", MineralSchema);
  
  // MongoDB Models
  const User = mongoose.model('User', userSchema);
  
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // Middleware
  app.use(cors());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
  // Route to create a new user
  app.post('/users/signup', async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;
    try {

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }


      const newUser = new User({ name, email, password, phoneNumber });
      await newUser.save();
      const token = jwt.sign({ userId: newUser._id }, secretkey, { expiresIn: '5m' });
  
      // Send email
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: 'Welcome to Mineral Insights',
        text: `Hello ${name},\n\nWelcome to Mineral Insights. You have successfully signed up.\n\nRegards,\nThe Mineral Insights Team`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  
      res.status(200).json({ success: true, token, userId: newUser._id, name });
    } catch (err) {
      console.log("eROR NOW ");
      console.log(err);
      if (err.code === 11000) {
        res.status(400).json({ success: false, message: 'Email already taken' });
      } else {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
      }
    }
  });
  
  // Route to log in a user
  app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      if( email == 'Varshitha' && password == 'Varshitha' ){
        const token = jwt.sign({ userId: 'Varshitha' }, secretkey, { expiresIn: '5m' });
        res.status(200).json({ success: true, token, userId: 'Varshitha', name: 'Varshitha' });
      }
      else{
        const user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user._id }, secretkey, { expiresIn: '5m' });
        res.status(200).json({ success: true, token, userId: user._id, name: user.name });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });
  
  // Middleware to validate JWT token
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
  
    // Extract token from header
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing' });
    }
  
    // Verify token
    jwt.verify(token, secretkey, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid token' });
      }
  
      // Attach user info to request (if needed later)
      req.user = user;
      next();
    });
  };
  
  app.get('/', authenticateToken, async (req, res) => {
    res.status(200).json({ success: true });
  });

  
  app.get('/chart/bauxite-production', authenticateToken, async (req, res) => {
    try {
      const data = await Mineral.aggregate([
        {
          $match: {
            Entity: { $in: ["Australia", "Guinea", "China", "Brazil", "India", "Indonesia", "Jamaica", "Russia", "Saudi Arabia", "Kazakhstan"] },
            Year: 2023 // Filter only records from the year 2023
          }
        },
        {
          $group: {
            _id: "$Entity",
            avgShare: { $avg: "$ShareOfGlobalProduction" } // Calculate average
          }
        },
        { $sort: { avgShare: -1 } } // Sort by descending average share
      ]);
  
      const labels = data.map(item => item._id);
      const shares = data.map(item => item.avgShare);
  
      res.json({ labels, shares });
    } catch (error) {
      console.error("Error fetching bauxite production data:", error);
      res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
  });
  
  app.get('/chart/bauxite-trends', authenticateToken, async (req, res) => {
    try {
      // Define the countries you want to include
      const includedCountries = [
        'Australia',
        'Guinea',
        'China',
        'Brazil',
        'India',
        'Indonesia',
        'Jamaica',
        'Russia',
        'Saudi Arabia',
        'Kazakhstan'
      ];
  
      // Fetch the data for the selected countries
      const results = await Mineral.find({ Entity: { $in: includedCountries } }).lean();
  
      // Group the data by years and format it for the chart
      const years = [...new Set(results.map((row) => row.Year))].sort((a, b) => a - b);
      const countriesData = includedCountries.map((country) => {
        const productionData = years.map((year) => {
          const record = results.find((row) => row.Entity === country && row.Year === year);
          return record ? record.ShareOfGlobalProduction : 0; // Default to 0 if no data
        });
  
        // Assign a unique color for each country (you can customize these colors)
        const colors = [
          '#FF6384', // Australia
          '#36A2EB', // Guinea
          '#FFCE56', // China
          '#4BC0C0', // Brazil
          '#9966FF', // India
          '#FF9F40', // Indonesia
          '#C9CBCF', // Jamaica
          '#2E86C1', // Russia
          '#A569BD', // Saudi Arabia
          '#58D68D'  // Kazakhstan
        ];
  
        return {
          name: country,
          production: productionData,
          color: colors[includedCountries.indexOf(country)]
        };
      });
  
      // Send the response
      res.json({
        years,
        countries: countriesData
      });
    } catch (error) {
      console.error('Error fetching bauxite trends:', error);
      res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
  });
  
  app.get('/chart/bauxite-reserves', authenticateToken, async (req, res) => {
    try {
      const countries = [
        'Australia',
        'Guinea',
        'China',
        'Brazil',
        'India',
        'Indonesia',
        'Jamaica',
        'Russia',
        'Saudi Arabia',
        'Kazakhstan',
      ];
      
      // Query to fetch data for the specified countries
      const query = { Entity: { $in: countries } };
      const records = await Mineral.find(query);
  
      // Aggregate the data to calculate total percentages for each country
      const aggregatedData = records.reduce((acc, record) => {
        if (!acc[record.Entity]) {
          acc[record.Entity] = 0;
        }
        acc[record.Entity] += record.ShareOfGlobalProduction;
        return acc;
      }, {});
  
      // Prepare the data for the frontend
      const data = Object.entries(aggregatedData).map(([name, totalPercentage]) => ({
        name,
        reservesPercentage: parseFloat(totalPercentage.toFixed(2)), // Sum of percentages, rounded to 2 decimals
      }));
  
      res.json({ success: true, data });
    } catch (error) {
      console.error('Failed to fetch bauxite reserves data:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  
  app.get('/chart/bauxite-trends-new', authenticateToken, async (req, res) => {
    try {
      // Specify the countries to include in the chart
      const countries = [
        'Australia',
        'Guinea',
        'China',
        'Brazil',
        'India',
        'Indonesia',
        'Jamaica',
        'Russia',
        'Saudi Arabia',
        'Kazakhstan',
      ];
  
      // Query the database to fetch records for the specified countries and years
      const records = await Mineral.find({ Entity: { $in: countries } });
  
      // Process the data to prepare for the frontend
      const data = {};
  
      records.forEach((record) => {
        const year = record.Year;
        const country = record.Entity;
        const percentage = record.ShareOfGlobalProduction;
  
        if (!data[year]) {
          data[year] = {};
        }
  
        data[year][country] = percentage;
      });
  
      // Transform the data into the required format for the frontend
      const years = Object.keys(data).sort((a, b) => a - b); // Sort years in ascending order
      const countriesData = countries.map((country) => {
        return {
          name: country,
          values: years.map((year) => data[year]?.[country] || 0), // Get the percentage for each year or default to 0
        };
      });
  
      res.json({
        success: true,
        data: {
          years,
          countries: countriesData,
        },
      });
    } catch (error) {
      console.error('Failed to fetch bauxite trends data:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  
  
