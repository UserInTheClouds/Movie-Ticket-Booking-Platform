import mongoose, { Schema, Document } from 'mongoose';

interface ISeat {
  row: string;
  col: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'LOCKED';
  lockedBy?: string;
}

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  theatre: mongoose.Types.ObjectId;
  screenName: string;
  startTime: Date;
  format: string;
  basePrice: number;
  seats: ISeat[];
}

const seatSchema = new Schema<ISeat>({
  row: { type: String, required: true },
  col: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'LOCKED'], default: 'AVAILABLE' },
  lockedBy: { type: String }
}, { _id: false });

const showtimeSchema = new Schema<IShowtime>({
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true },
  screenName: { type: String, required: true },
  startTime: { type: Date, required: true },
  format: { type: String, required: true },
  basePrice: { type: Number, required: true },

  seats: [seatSchema]
});

export default (mongoose.models.Showtime as mongoose.Model<IShowtime>) || mongoose.model<IShowtime>('Showtime', showtimeSchema);
