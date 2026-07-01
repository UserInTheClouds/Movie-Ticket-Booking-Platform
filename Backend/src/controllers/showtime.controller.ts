import { type Request, type Response } from 'express';
import Showtime from '../models/showtime.js';

export const getShowtimesByMovie = async (req: Request, res: Response) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId as any })
      .populate('theatre')
      .sort({ startTime: 1 });

    res.json(showtimes);
  } catch (err) {
    console.error("Error fetching showtimes:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching showtimes.' });
  }
};

export const getShowtimeSeats = async (req: Request, res: Response) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId).select('seats basePrice screenName startTime format theatre movie');
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    res.json(showtime);
  } catch (err) {
    console.error("Error fetching seats:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching seats.' });
  }
};
