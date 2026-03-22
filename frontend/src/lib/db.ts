// @ts-ignore - node:sqlite is experimental in Node 23/24
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Local SQLite Connection for Frontend (Next.js Server Components/Actions)
const dbPath = path.join(process.cwd(), '../lms.db');
const db = new DatabaseSync(dbPath);

let isInitialized = false;

const initializeDatabase = async () => {
    if (isInitialized) return;
    console.log('🔄 [Frontend] Using node:sqlite for database connection...');
    try {
        // Simple check to ensure we can connect
        db.prepare('SELECT 1').get();
        isInitialized = true;
        console.log('✅ [Frontend] node:sqlite Database connection successful');
    } catch (error: any) {
        console.error('❌ [Frontend] node:sqlite Connection Error:', error.message);
        throw error;
    }
};

export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    try {
        if (!isInitialized) {
            await initializeDatabase();
        }

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
        console.error('❌ Frontend node:sqlite Error:', {
            message: error.message,
            query: query.substring(0, 50) + '...'
        });
        throw error;
    }
};
