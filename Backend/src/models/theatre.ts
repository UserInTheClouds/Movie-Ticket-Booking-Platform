import mongoose, { Schema, Document } from 'mongoose';

export interface ITheatre extends Document {
  name: string;
  location: string;
  logoUrl?: string;
}

const theatreSchema = new Schema<ITheatre>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  logoUrl: { type: String }
});

export default (mongoose.models.Theatre as mongoose.Model<ITheatre>) || mongoose.model<ITheatre>('Theatre', theatreSchema);
