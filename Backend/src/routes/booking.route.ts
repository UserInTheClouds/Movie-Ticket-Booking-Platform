import express from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/my-tickets', protectRoute, getUserBookings);
router.put('/my-tickets/:id/cancel', protectRoute, cancelBooking);
router.post('/', protectRoute, createBooking);

export default router;
