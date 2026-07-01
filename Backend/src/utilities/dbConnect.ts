import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    const conn = await mongoose.connect(databaseUrl as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
