const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv"); // For using process.env
// const scrapeRoutes = require('./Routes/scrapeRoutes');

const app = express();

// Middleware
dotenv.config();
app.use(cors());
app.use(express.json());

// Database
mongoose.set('strictQuery', false);
const mongoURL = `mongodb+srv://Taransh121:${process.env.MongoDB_Password}@taransh7.7lstu.mongodb.net/?retryWrites=true&w=majority&appName=Taransh7`;


mongoose.connect(mongoURL)
    .then(() => {
        console.log("Database connected successfully.");
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });

// Routes
// app.use('/api/scrape', scrapeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
