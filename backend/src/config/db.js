import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};
