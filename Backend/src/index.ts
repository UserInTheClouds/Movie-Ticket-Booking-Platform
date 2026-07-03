import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import './config/firebaseAdmin.js';
import connectDB from './utilities/dbConnect.js';
import mongoose from 'mongoose';
import movieRoutes from './routes/movie.route.js';
import showtimeRoutes from './routes/showtime.route.js';
import bookingRoutes from './routes/booking.route.js';
import theatreRoutes from './routes/theatre.route.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/theatres', theatreRoutes);

// Health check endpoint for cron-job.org or similar services
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.listen(Number(PORT) || 5000, "0.0.0.0", () => {
    console.log("Server is running at port", PORT || 5000);
});

export default app;