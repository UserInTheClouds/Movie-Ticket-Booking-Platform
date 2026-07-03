import express from 'express';
import { getShowtimesByMovie, getShowtimeSeats } from '../controllers/showtime.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/movie/:movieId', protectRoute, getShowtimesByMovie);

router.get('/:showtimeId/seats', protectRoute, getShowtimeSeats);

export default router;
