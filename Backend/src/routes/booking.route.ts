import express from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Apply a rate limit: max 5 bookings per 15 minutes per IP
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many booking requests from this IP, please try again after 15 minutes' }
});

router.get('/my-tickets', protectRoute, getUserBookings);
router.put('/my-tickets/:id/cancel', protectRoute, cancelBooking);
router.post('/', protectRoute, bookingLimiter, createBooking);

export default router;
