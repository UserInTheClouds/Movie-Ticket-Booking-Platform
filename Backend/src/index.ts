import express from 'express'
import dotenv from 'dotenv'
import './config/firebaseAdmin.js';
import connectDB from './utilities/dbConnect.js';
import mongoose from 'mongoose';
import movieRoutes from './routes/movie.route.js';
import showtimeRoutes from './routes/showtime.route.js';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

const monitorDBConnection = () => {
    mongoose.connection.on('connected', () => {
        console.log("Mongoose is successfully connected to the database");
    });

    mongoose.connection.on('error', (err) => {
        console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log("Mongoose connection is disconnected");
    });
};

monitorDBConnection();
connectDB();

app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);

app.listen(Number(PORT), "0.0.0.0", () => {
    console.log("Server is running at port", PORT);
});