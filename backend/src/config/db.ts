// @ts-ignore - node:sqlite is experimental in Node 23/24
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = path.join(__dirname, '../../../lms.db');
const db = new DatabaseSync(dbPath);

// Initializing the database if it doesn't exist
const initializeDatabase = async () => {
  console.log('🔄 [Backend] Using node:sqlite for database operations...');
  try {
    const schema = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'STUDENT',
        refresh_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        duration INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE(user_id, subject_id)
      )`,
      `CREATE TABLE IF NOT EXISTS video_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        progress_seconds INTEGER DEFAULT 0,
        is_completed INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        UNIQUE(user_id, video_id)
      )`
    ];

    for (const query of schema) {
      db.exec(query);
    }
    
    const countResult: any = db.prepare('SELECT COUNT(*) as count FROM subjects').get();
    if (countResult.count === 0) {
      console.log('🌱 [Backend] Seeding initial database data...');
      const seedQueries = [
        // Users
        { query: `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [1, 'Admin User', 'admin@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'ADMIN'] },
        
        // Subjects
        { query: `INSERT INTO subjects (id, title, description, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [1, 'Full-Stack Web Development', 'Learn Next.js and Node.js', 1] },
        { query: `INSERT INTO subjects (id, title, description, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [2, 'Data Science with Python', 'Learn Pandas, NumPy, and Machine Learning', 2] },
        { query: `INSERT INTO subjects (id, title, description, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [3, 'Java Full Stack Development', 'Master Core Java, Spring Boot, and React Integration', 3] },

        // Sections for Full-Stack
        { query: `INSERT INTO sections (id, subject_id, title, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [1, 1, 'Introduction to React & Next.js', 1] },
        { query: `INSERT INTO sections (id, subject_id, title, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [2, 1, 'Advanced Next.js Concepts', 2] },
        
        // Videos for Full-Stack
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [1, 1, 'What is Next.js?', 'https://www.youtube.com/watch?v=Sklc_fQBmcs', 600, 1] },
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [2, 1, 'Routing in Next.js', 'https://www.youtube.com/watch?v=wm5gMKuwSYk', 800, 2] },
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [3, 2, 'Server Actions and API Routes', 'https://www.youtube.com/watch?v=dDpZfOQBMaU', 1200, 1] },

        // Sections for Data Science
        { query: `INSERT INTO sections (id, subject_id, title, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [3, 2, 'Python for Data Analysis', 1] },
        { query: `INSERT INTO sections (id, subject_id, title, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [4, 2, 'Machine Learning Fundamentals', 2] },

        // Videos for Data Science
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [4, 3, 'Data Analysis with Pandas', 'https://www.youtube.com/watch?v=vmEHCJofslg', 900, 1] },
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [5, 4, 'Machine Learning Basics', 'https://www.youtube.com/watch?v=1u888p0CjUE', 1000, 1] },

        // Sections for Java
        { query: `INSERT INTO sections (id, subject_id, title, order_index) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [5, 3, 'Core Java & Spring Boot', 1] },

        // Videos for Java
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [6, 5, 'Java Syntax & OOPs', 'https://www.youtube.com/watch?v=BGTx91t8q50', 700, 1] },
        { query: `INSERT INTO videos (id, section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`, params: [7, 5, 'Spring Boot REST API', 'https://www.youtube.com/watch?v=9SGDpanrc8U', 1200, 2] }

      ];
      for (const item of seedQueries) {
        db.prepare(item.query).run(...item.params);
      }
    }

    console.log('✅ [Backend] node:sqlite Database initialized successfully');
  } catch (error: any) {
    console.error('❌ [Backend] node:sqlite Initialization Error:', error.message);
    throw error;
  }
};

export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    const stmt = db.prepare(query);
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params);
    } else {
      const result: any = stmt.run(...params);
      return {
        insertId: result.lastInsertRowid,
        affectedRows: result.changes
      };
    }
  } catch (error: any) {
    console.error('❌ node:sqlite Query Error:', error.message);
    throw error;
  }
};

const setupDb = async () => {
  await initializeDatabase();
};

export default setupDb;

