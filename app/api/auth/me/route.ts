import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const result = verifyAdminToken(token);

  if (!result.valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username: result.username,
  });
}
