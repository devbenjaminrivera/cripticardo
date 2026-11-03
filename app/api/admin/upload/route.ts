import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Por favor sube JPG, PNG, WebP o GIF.' },
        { status: 400 }
      );
    }

    // Límite de 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen supera el tamaño máximo permitido de 5 MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `cryptics/${safeName}`;

    // 1. Intentar subir a Supabase Storage bucket 'cryptic-images'
    if (supabase) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cryptic-images')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('cryptic-images')
            .getPublicUrl(filePath);

          return NextResponse.json({ url: urlData.publicUrl });
        }

        console.warn('Supabase storage upload error:', uploadError?.message);
      } catch (storageErr) {
        console.warn('Excepción al conectar con Supabase storage:', storageErr);
      }
    }

    // 2. Respaldo transparente (Base64) si el bucket aún no existe o Supabase no está configurado
    const base64Url = `data:${file.type};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      url: base64Url,
      fallback: true,
      message: 'Imagen procesada exitosamente.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar la imagen';
    console.error('Error en /api/admin/upload:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

