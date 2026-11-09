import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin2570';
    const adminSecret = process.env.ADMIN_SECRET || 'sisaket2570admin';

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
      response.cookies.set({
        name: 'admin_token',
        value: adminSecret,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง (Invalid Admin Password)' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || 'sisaket2570admin';
  const cookie = req.cookies.get('admin_token')?.value;
  return NextResponse.json({ authenticated: cookie === adminSecret });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('admin_token');
  return response;
}

