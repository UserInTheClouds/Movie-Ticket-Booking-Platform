import { type Request, type Response } from 'express';
import Movie from '../models/movie.js';

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find().sort({ releaseDate: -1 });
    res.json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching movies.' });
  }
};

export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    console.error("Error fetching movie details:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching movie details.' });
  }
};
