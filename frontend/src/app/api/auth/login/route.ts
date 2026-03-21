import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'my-super-secret-refresh-key';

const generateTokens = (user: { id: number; email: string; role: string }) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        await executeQuery('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

        return NextResponse.json({
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        
        // Context-aware hints for the user
        let hint = undefined;
        if (['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
            hint = 'Database connection failed. Please verify DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in Vercel Environment Variables.';
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            hint = 'Table missing. Auto-initialization should fix this on the next request. If it persists, check your DB permissions.';
        }

        return NextResponse.json(
            {
                message: 'Error logging in',
                error: error.message,
                code: error.code,
                hint: hint
            },
            { status: 500 }
        );
    }
}
