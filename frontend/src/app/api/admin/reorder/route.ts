import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';

export async function PUT(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { table, items } = await request.json();
        if (!['subjects', 'sections', 'videos'].includes(table)) {
            return NextResponse.json({ message: 'Invalid table' }, { status: 400 });
        }

        await Promise.all(items.map((item: any) =>
            executeQuery(`UPDATE ${table} SET order_index = ? WHERE id = ?`, [item.orderIndex, item.id])
        ));

        return NextResponse.json({ message: 'Order updated' });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ message: 'Error updating order', error: String(error) }, { status: 500 });
    }
}
