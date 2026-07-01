import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema);
