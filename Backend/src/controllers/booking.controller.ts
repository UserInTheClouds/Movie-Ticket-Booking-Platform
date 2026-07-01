import type { Request, Response } from 'express';
import Booking from '../models/booking.js';
import Showtime from '../models/showtime.js';

export const createBooking = async (req: Request & { user?: any }, res: Response): Promise<any> => {
  try {
    const { showtimeId, seats, ticketPrice, bookingFee, totalAmount, paymentMethod } = req.body;
    const userUid = req.user?.uid;

    if (!userUid) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Fetch the Showtime
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    // 2. Validate seat availability
    for (const requestedSeat of seats) {
      const seatInDb = showtime.seats.find((s: any) => s.row === requestedSeat.row && s.col === requestedSeat.col);
      
      if (!seatInDb) {
        return res.status(400).json({ error: `Seat ${requestedSeat.row}${requestedSeat.col} does not exist.` });
      }
      if (seatInDb.status === 'OCCUPIED') {
        return res.status(400).json({ error: `Seat ${requestedSeat.row}${requestedSeat.col} is already booked by someone else!` });
      }
    }

    // 3. Mark seats as OCCUPIED
    for (const requestedSeat of seats) {
      const seatInDb = showtime.seats.find((s: any) => s.row === requestedSeat.row && s.col === requestedSeat.col);
      if (seatInDb) {
        seatInDb.status = 'OCCUPIED';
      }
    }
    
    // Save updated showtime back to DB
    await showtime.save();

    // 4. Create the final Booking record
    const qrCodeData = `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
    
    const newBooking = new Booking({
      userUid,
      showtime: showtimeId,
      seats,
      ticketPrice,
      bookingFee,
      totalAmount,
      paymentMethod,
      qrCodeData
    });

    await newBooking.save();

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: 'An unexpected error occurred during booking.' });
  }
};
