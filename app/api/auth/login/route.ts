import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Debes ingresar usuario y contraseña.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase no está configurado.' },
        { status: 500 }
      );
    }

    // Verificar credenciales usando la función de base de datos en Supabase
    const { data: isValid, error } = await supabase.rpc('verify_admin_credentials', {
      p_username: cleanUsername,
      p_password: cleanPassword,
    });

    if (error) {
      console.error('Error al verificar credenciales con Supabase RPC:', error);
      return NextResponse.json(
        {
          success: false,
          error:
            'Error al validar credenciales en la base de datos. Asegúrate de haber ejecutado el script SQL de usuarios en Supabase.',
        },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Usuario o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    // Credenciales correctas: generar token de sesión
    const token = signAdminToken(cleanUsername);

    const response = NextResponse.json({
      success: true,
      username: cleanUsername,
    });

    // Guardar cookie HTTP-Only segura
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (err) {
    console.error('Excepción en login:', err);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error inesperado al iniciar sesión.' },
      { status: 500 }
    );
  }
}
