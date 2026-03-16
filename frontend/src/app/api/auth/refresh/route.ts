import { NextResponse } from 'next/server';
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
        const { token } = await request.json();
        if (!token) return NextResponse.json({ message: 'Refresh token required' }, { status: 401 });

        const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
        const users = await executeQuery('SELECT * FROM users WHERE id = ? AND refresh_token = ?', [decoded.id, token]);

        if (users.length === 0) {
            return NextResponse.json({ message: 'Invalid refresh token' }, { status: 403 });
        }

        const user = users[0];
        const tokens = generateTokens(user);
        await executeQuery('UPDATE users SET refresh_token = ? WHERE id = ?', [tokens.refreshToken, user.id]);

        return NextResponse.json(tokens);
    } catch (error) {
        return NextResponse.json({ message: 'Invalid refresh token', error: String(error) }, { status: 403 });
    }
}
