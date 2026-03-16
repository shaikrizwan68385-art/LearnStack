import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};
