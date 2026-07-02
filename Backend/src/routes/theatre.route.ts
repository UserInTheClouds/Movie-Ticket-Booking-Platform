import express from 'express';
import { getAllTheatres, getTheatreById } from '../controllers/theatre.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// GET /api/theatres
router.get('/', protectRoute, getAllTheatres);
router.get('/:id', protectRoute, getTheatreById);

export default router;
