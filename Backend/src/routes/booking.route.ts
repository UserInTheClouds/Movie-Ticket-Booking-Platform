import express from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// GET /api/bookings/my-tickets
router.get('/my-tickets', protectRoute, getUserBookings);

// PUT /api/bookings/my-tickets/:id/cancel
router.put('/my-tickets/:id/cancel', protectRoute, cancelBooking);

// POST /api/bookings
router.post('/', protectRoute, createBooking);

export default router;
