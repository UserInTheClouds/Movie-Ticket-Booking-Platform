import type { Request, Response } from 'express';
import Booking from '../models/booking.js';
import Showtime from '../models/showtime.js';

export const createBooking = async (req: Request & { user?: any }, res: Response): Promise<any> => {
  try {
    const { showtimeId, seats, paymentMethod } = req.body;
    const userUid = req.user?.uid;

    if (!userUid) return res.status(401).json({ error: 'Unauthorized' });

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    if (seats && seats.length > 10) {
      return res.status(400).json({ error: 'Cannot book more than 10 seats in a single transaction.' });
    }

    let calculatedTicketPrice = 0;
    const calculatedBookingFee = 20;

    for (const requestedSeat of seats) {
      const seatInDb = showtime.seats.find((s: any) => s.row === requestedSeat.row && s.col === requestedSeat.col);

      if (!seatInDb) {
        return res.status(400).json({ error: `Seat ${requestedSeat.row}${requestedSeat.col} does not exist.` });
      }
      if (seatInDb.status === 'OCCUPIED') {
        const seatName = `${requestedSeat.row}${seatInDb.label || seatInDb.col}`;
        return res.status(409).json({ error: `Payment failed. Seat ${seatName} was already booked by someone else. Please select seats again` });
      }

      // Calculate price securely on backend
      const seatType = requestedSeat.type === 'PRIME' ? 'PRIME' : 'REGULAR';
      calculatedTicketPrice += (seatType === 'PRIME' ? showtime.basePrice + 60 : showtime.basePrice);
    }

    const calculatedTotalAmount = calculatedTicketPrice + calculatedBookingFee;

    const condition: any = { _id: showtime._id };
    const updateOperations: any = {};

    for (const requestedSeat of seats) {
      const seatIndex = showtime.seats.findIndex((s: any) => s.row === requestedSeat.row && s.col === requestedSeat.col);
      const currentVersion = showtime.seats[seatIndex]!.version || 0;

      condition[`seats.${seatIndex}.version`] = currentVersion === 0 ? { $in: [0, null] } : currentVersion;

      updateOperations[`seats.${seatIndex}.status`] = 'OCCUPIED';
      updateOperations[`seats.${seatIndex}.version`] = currentVersion + 1;
    }

    const result = await Showtime.updateOne(condition, { $set: updateOperations });

    if (result.modifiedCount === 0) {
      const latestShowtime = await Showtime.findById(showtimeId);
      let conflictingSeats = [];
      if (latestShowtime) {
        for (const requestedSeat of seats) {
          const seatInDb = latestShowtime.seats.find((s: any) => s.row === requestedSeat.row && s.col === requestedSeat.col);
          if (seatInDb && seatInDb.status === 'OCCUPIED') {
            conflictingSeats.push(`${requestedSeat.row}${seatInDb.label || seatInDb.col}`);
          }
        }
      }
      const seatsStr = conflictingSeats.length > 0 ? (conflictingSeats.length === 1 ? `Seat ${conflictingSeats[0]}` : `Seats ${conflictingSeats.join(', ')}`) : 'One or more seats';
      const verb = conflictingSeats.length > 1 ? 'were' : 'was';
      return res.status(409).json({ error: `Payment failed. ${seatsStr} ${verb} already booked by someone else. Please select seats again` });
    }

    const qrCodeData = `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;

    const newBooking = new Booking({
      userUid,
      showtime: showtimeId,
      seats,
      ticketPrice: calculatedTicketPrice,
      bookingFee: calculatedBookingFee,
      totalAmount: calculatedTotalAmount,
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

export const getUserBookings = async (req: Request & { user?: any }, res: Response): Promise<any> => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: 'Unauthorized' });

    const bookings = await Booking.find({ userUid })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title bannerUrl ageRating formats genres' },
          { path: 'theatre', select: 'name location' }
        ]
      })
      .sort({ transactionDate: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching bookings.' });
  }
};

export const cancelBooking = async (req: Request & { user?: any }, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userUid = req.user?.uid;

    if (!userUid) return res.status(401).json({ error: 'Unauthorized' });

    const booking = await Booking.findById(id);
    if (!booking || booking.userUid !== userUid) {
      return res.status(404).json({ error: 'Booking not found or unauthorized.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    const showtime = await Showtime.findById(booking.showtime);
    if (showtime) {
      for (const bookedSeat of booking.seats) {
        const seatInDb = showtime.seats.find((s: any) => s.row === bookedSeat.row && s.col === bookedSeat.col);
        if (seatInDb) {
          seatInDb.status = 'AVAILABLE';
        }
      }
      await showtime.save();
    }

    res.status(200).json({ message: 'Booking successfully cancelled.', booking });
  } catch (err) {
    console.error("Cancel Booking Error:", err);
    res.status(500).json({ error: 'An unexpected error occurred during cancellation.' });
  }
};
