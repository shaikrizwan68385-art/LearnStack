import mysql from 'mysql2/promise';

// Vercel-compatible MySQL Connection configuration for Frontend API Routes
// IMPORTANT: Use the EXTERNAL/PUBLIC hostname from Railway (e.g., xxx.railway.app),
// NOT the .internal one, as Vercel is outside the Railway network.
const pool = process.env.DATABASE_URL 
    ? mysql.createPool(process.env.DATABASE_URL)
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


export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    try {
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
        console.error('❌ Frontend DB Error:', {
            message: error.message,
            code: error.code
        });
        throw error;
    }
};
