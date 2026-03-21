import mysql from 'mysql2/promise';

// Vercel-compatible MySQL Connection configuration for Frontend API Routes
// IMPORTANT: Use the EXTERNAL/PUBLIC hostname from Railway (e.g., xxx.railway.app),
// NOT the .internal one, as Vercel is outside the Railway network.
// Support multiple environment variable names for Railway/Vercel URL
const dbUrl = process.env.DATABASE_URL || process.env.DB_PUBLIC_URL;

const pool = dbUrl 
    ? mysql.createPool(dbUrl)
    : mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
        ssl: {
            rejectUnauthorized: false
        }
    });

// Schema initialization queries (derived from backend/schema.sql)
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

const seedQueries = [
    // Seed Users (Admin & Student)
    `INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
    (1, 'Admin User', 'admin@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'ADMIN'),
    (2, 'Student User', 'student@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'STUDENT')`,
    
    // Seed Subjects
    `INSERT IGNORE INTO subjects (id, title, description, order_index) VALUES 
    (1, 'Full-Stack Web Development', 'Learn Next.js and Node.js', 1),
    (2, 'Data Science with Python', 'Learn Pandas, NumPy, and Machine Learning', 2),
    (3, 'Java Full Stack Development', 'Master Core Java, Spring Boot, MySQL, and Frontend Integration', 3)`,
    
    // Seed Sections
    `INSERT IGNORE INTO sections (id, subject_id, title, order_index) VALUES 
    (1, 1, 'Introduction to React & Next.js', 1),
    (2, 1, 'Advanced Next.js Concepts', 2),
    (3, 2, 'Python Basics', 1),
    (4, 2, 'Advanced Python & Automation', 2),
    (5, 3, 'Core Java Fundamentals', 1),
    (6, 3, 'Backend Development with Spring', 2),
    (7, 3, 'Full Stack Integration', 3)`,
    
    // Seed Videos
    `INSERT IGNORE INTO videos (id, section_id, title, video_url, duration, order_index) VALUES 
    (1, 1, 'What is Next.js?', 'https://www.youtube.com/watch?v=Sklc_fQBmcs', 600, 1),
    (2, 1, 'Routing in Next.js', 'https://www.youtube.com/watch?v=wm5gMKuwSYk', 800, 2),
    (3, 2, 'Server Actions', 'https://www.youtube.com/watch?v=dDpZfOQBMaU', 1200, 1),
    (4, 3, 'Python Hello World', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 400, 1)`
];

let isInitialized = false;

const initializeDatabase = async () => {
    if (isInitialized) return;
    console.log('🔄 Checking database initialization...');
    try {
        const connection = await pool.getConnection();
        
        // Create tables
        for (const query of schema) {
            await connection.execute(query);
        }
        
        // Seed data if empty
        const [rows]: any = await connection.execute('SELECT COUNT(*) as count FROM subjects');
        if (rows[0].count === 0) {
            console.log('🌱 Seeding initial database data...');
            for (const query of seedQueries) {
                await connection.execute(query);
            }
        }

        connection.release();
        isInitialized = true;
        console.log('✅ Database initialized and seeded successfully');
    } catch (error: any) {
        console.error('❌ Failed to initialize database:', error.message);
        throw error;
    }
};

export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    try {
        // Auto-initialize on first query to ensure tables exist
        if (!isInitialized) {
            await initializeDatabase();
        }

        const [results] = await pool.execute(query, params);

        if (Array.isArray(results)) {
            return results;
        }

        const info = results as any;
        return {
            insertId: info.insertId,
            affectedRows: info.affectedRows
        };
    } catch (error: any) {
        // Handle case where table is missing but initialization was skipped or failed
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('⚠️ Table missing, re-attempting initialization...');
            isInitialized = false;
            await initializeDatabase();
            // Re-execute query after init
            const [results] = await pool.execute(query, params);
            if (Array.isArray(results)) return results;
            const info = results as any;
            return { insertId: info.insertId, affectedRows: info.affectedRows };
        }

        console.error('❌ Frontend DB Error:', {
            message: error.message,
            code: error.code
        });
        throw error;
    }
};

