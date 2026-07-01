import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userUid: string;
  showtime: mongoose.Types.ObjectId;
  seats: { row: string; col: number }[];
  ticketPrice: number;
  bookingFee: number;
  totalAmount: number;
  paymentMethod: string;
  transactionDate: Date;
  qrCodeData: string;
}

const bookingSchema = new Schema<IBooking>({
  userUid: { type: String, required: true },
  showtime: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [{
    row: { type: String, required: true },
    col: { type: Number, required: true }
  }],
  ticketPrice: { type: Number, required: true },
  bookingFee: { type: Number, required: true, default: 20 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  transactionDate: { type: Date, default: Date.now },
  qrCodeData: { type: String, required: true }
});

export default (mongoose.models.Booking as mongoose.Model<IBooking>) || mongoose.model<IBooking>('Booking', bookingSchema);
