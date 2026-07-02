import { type Request, type Response } from 'express';
import Showtime from '../models/showtime.js';
import Theatre from '../models/theatre.js';
import Movie from '../models/movie.js';

export const getShowtimesByMovie = async (req: Request, res: Response): Promise<any> => {
  try {
    let showtimes = await Showtime.find({ movie: req.params.movieId as any })
      .populate('theatre')
      .sort({ startTime: 1 });

    if (showtimes.length === 0) {
      let theatres = await Theatre.find();
      if (theatres.length === 0) {
        theatres = await Theatre.insertMany([
          { name: 'PVR Cinemas', location: 'City Mall, Downtown', logoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80' },
          { name: 'INOX', location: 'Orion Hub, North West', logoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80' },
          { name: 'Cinepolis', location: 'Grand Avenue, South', logoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=150&q=80' }
        ]);
      }

      const movie = await Movie.findById(req.params.movieId);
      if (!movie) return res.status(404).json({ error: 'Movie not found' });

      const newShowtimes = [];
      const formats = movie.formats && movie.formats.length > 0 ? movie.formats : ['2D'];
      const screens = ['Screen 1', 'Screen 2', 'Screen 3'];
      const times = ['10:00 AM', '01:30 PM', '05:00 PM', '08:30 PM'];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (movie.status === 'COMING_SOON') {
          today.setDate(today.getDate() + 7);
      }

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        for (const theatre of theatres) {
          for (let j = 0; j < times.length; j++) {
            const timeStr = times[j] as string;
            const format = formats[j % formats.length];
            const screen = screens[j % screens.length];

            const [time, modifier] = timeStr.split(' ') as [string, string];
            let [hours, minutes] = time.split(':') as [string, string];
            let h = parseInt(hours, 10);
            if (h === 12) h = 0;
            if (modifier === 'PM') h += 12;

            const startTime = new Date(currentDate);
            startTime.setHours(h, parseInt(minutes || '0', 10), 0, 0);

            const seats = [];
            const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
            for (const row of rowLabels) {
              for (let col = 1; col <= 12; col++) {
                seats.push({
                  row,
                  col,
                  status: Math.random() > 0.85 ? 'OCCUPIED' : 'AVAILABLE'
                });
              }
            }

            newShowtimes.push({
              movie: movie._id,
              theatre: theatre._id,
              startTime,
              format,
              screenName: screen,
              basePrice: 250,
              seats
            });
          }
        }
      }

      await Showtime.insertMany(newShowtimes);
      
      showtimes = await Showtime.find({ movie: req.params.movieId as any })
        .populate('theatre')
        .sort({ startTime: 1 });
    }

    res.json(showtimes);
  } catch (err) {
    console.error("Error fetching showtimes:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching showtimes.' });
  }
};

export const getShowtimeSeats = async (req: Request, res: Response) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId)
        .select('seats basePrice screenName startTime format theatre movie')
        .populate('theatre')
        .populate('movie');
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    res.json(showtime);
  } catch (err) {
    console.error("Error fetching seats:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching seats.' });
  }
};
