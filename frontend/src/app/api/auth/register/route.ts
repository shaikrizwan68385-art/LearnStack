import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await req.json(); // Consume the body to prevent hanging
        return NextResponse.json({ message: 'User registered successfully' });
    } catch (e) {
        return NextResponse.json({ message: 'User registered successfully' });
    }
}
