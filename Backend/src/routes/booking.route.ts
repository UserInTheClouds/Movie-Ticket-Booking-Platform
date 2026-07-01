import express from 'express';
import { createBooking } from '../controllers/booking.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// POST /api/bookings
router.post('/', protectRoute, createBooking);

export default router;
