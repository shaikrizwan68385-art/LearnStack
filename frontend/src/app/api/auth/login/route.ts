import { NextResponse } from 'next/server';
import { MOCK_USER } from '../../../lib/mock-data';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    // For the demo, we allow any valid-looking login
    if (email && password) {
        return NextResponse.json({
            message: 'Login successful',
            user: MOCK_USER,
            accessToken: 'mock-access-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now()
        });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
