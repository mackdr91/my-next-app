import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import connectDB from '../src/utils/db.js';
import Sneaker from '../src/models/Sneaker.js';

async function migrateData() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Read the JSON file
        const jsonPath = path.join(process.cwd(), 'public', 'sneaker.json');
        const data = await fs.readFile(jsonPath, 'utf8');
        const { sneakers } = JSON.parse(data);

        // Clear existing data
        await Sneaker.deleteMany({});

        // Insert all sneakers
        const result = await Sneaker.insertMany(sneakers);
        
        console.log(`Successfully migrated ${result.length} sneakers to MongoDB`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
