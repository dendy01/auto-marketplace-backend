import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: 'postgres',
    password: '123ZHEKA1234zheka',
    host: 'localhost',
    database: 'auto_marketplace',
    port: 5432
});

// Database initialization queries
const initDatabase = async () => {
    const client = await pool.connect();
    
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                role VARCHAR(20) DEFAULT 'USER',
                avatar VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS cars (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                brand VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                year INTEGER NOT NULL,
                price NUMERIC NOT NULL,
                mileage INTEGER NOT NULL,
                description TEXT,
                transmission VARCHAR(50),
                body_type VARCHAR(50),
                fuel_type VARCHAR(50),
                engine_volume NUMERIC(3,1),
                power INTEGER,
                images TEXT[],
                status VARCHAR(20) DEFAULT 'ACTIVE',
                views INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                car_id INTEGER REFERENCES cars(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, car_id)
            )
        `);

    } finally {
        client.release();
    }
};

// Add this initialization function
const initialize = async () => {
    try {
        await initDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Export the initialization function
export { pool, initDatabase, initialize };
