import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env if running from terminal
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
};

const dbUrl = process.env.DATABASE_URL || process.env.DB_PUBLIC_URL;

const schema = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
      refresh_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS videos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      video_url VARCHAR(255) NOT NULL,
      duration INT DEFAULT 0,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS enrollments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      subject_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      UNIQUE KEY unique_enrollment (user_id, subject_id)
    )`,
    `CREATE TABLE IF NOT EXISTS video_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      video_id INT NOT NULL,
      progress_seconds INT DEFAULT 0,
      is_completed BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      UNIQUE KEY unique_progress (user_id, video_id)
    )`
];

const seed = [
    `INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
    (1, 'Admin User', 'admin@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'ADMIN'),
    (2, 'Student User', 'student@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'STUDENT')`,
    `INSERT IGNORE INTO subjects (id, title, description, order_index) VALUES 
    (1, 'Full-Stack Web Development', 'Learn Next.js and Node.js', 1),
    (2, 'Data Science with Python', 'Learn Pandas, NumPy, and Machine Learning', 2),
    (3, 'Java Full Stack Development', 'Master Core Java, Spring Boot, MySQL, and Frontend Integration', 3)`
];

async function runMigration() {
    console.log('🚀 Starting Database Migration...');
    let connection;
    try {
        if (dbUrl) {
            console.log('🔗 Using DATABASE_URL connection...');
            connection = await mysql.createConnection(dbUrl);
        } else {
            console.log(`🔗 Connecting to ${dbConfig.host}:${dbConfig.port}...`);
            connection = await mysql.createConnection(dbConfig);
        }

        console.log('✅ Connected successfully.');

        console.log('🏗️ Creating tables...');
        for (const query of schema) {
            await connection.execute(query);
        }

        console.log('🌱 Seeding initial data...');
        for (const query of seed) {
            await connection.execute(query);
        }

        console.log('✨ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Hint: Check if your database is running and the host/port are correct.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Hint: Check your database credentials (USER/PASSWORD).');
        }
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
