import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  bannerUrl: string;
  posterUrl?: string;
  trailerYoutubeUrl?: string;
  description: string;
  ageRating: string;
  starRating: number;
  releaseDate: Date;
  formats: string[];
  genres: string[];
  cast: {
    name: string;
    role: string;
    imageUrl: string;
  }[];
  status: 'NOW_SHOWING' | 'COMING_SOON';
}

const movieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  posterUrl: { type: String },
  trailerYoutubeUrl: { type: String },
  description: { type: String, required: true },
  ageRating: { type: String, required: true },
  starRating: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  formats: [{ type: String }],
  genres: [{ type: String }],
  cast: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    imageUrl: { type: String, required: true }
  }],
  status: { type: String, enum: ['NOW_SHOWING', 'COMING_SOON'], required: true }
});

export default (mongoose.models.Movie as mongoose.Model<IMovie>) || mongoose.model<IMovie>('Movie', movieSchema);
