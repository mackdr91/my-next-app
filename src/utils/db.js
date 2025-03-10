import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const connection = await mongoose.connect(MONGODB_URI, opts);
        console.log('MongoDB connected successfully');
        return connection;
    } catch (error) {
        if (retries > 0) {
            console.log(`MongoDB connection failed, retrying in ${RETRY_DELAY}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retries - 1);
        }
        console.error('MongoDB connection failed after all retries:', error);
        throw error;
    }
}

export async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = connectWithRetry();
    }

    try {
        cached.conn = await cached.promise;

        // Handle connection errors
        cached.conn.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
            cached.promise = null;
            cached.conn = null;
        });

        // Handle disconnection
        cached.conn.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            cached.promise = null;
            cached.conn = null;
        });

        return cached.conn;
    } catch (error) {
        console.error('Error establishing MongoDB connection:', error);
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
}


