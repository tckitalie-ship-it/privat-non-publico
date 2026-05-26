import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
  ]);
}
