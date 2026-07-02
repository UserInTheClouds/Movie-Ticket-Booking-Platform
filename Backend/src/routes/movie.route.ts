import express from 'express';
import { getAllMovies, getMovieDetails } from '../controllers/movie.controller.js';
import { verifyAuth as protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/', getAllMovies);

router.get('/:id', protectRoute, getMovieDetails);

export default router;
