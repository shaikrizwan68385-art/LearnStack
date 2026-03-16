import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key';

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    } catch (error) {
        return null;
    }
};

export const getUserFromRequest = (request: Request) => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    return verifyToken(token);
};
