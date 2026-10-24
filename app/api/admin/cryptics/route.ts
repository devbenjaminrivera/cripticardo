import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { mapRowToCryptic } from '@/lib/dataService';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

// GET: Obtener todos los crípticos (incluyendo los programados a futuro) para el panel de administración
export async function GET(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('cryptics')
    .select('*')
    .order('scheduled_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ? data.map(mapRowToCryptic) : []);
}

// POST: Crear o actualizar un críptico (requiere autenticación de admin)
export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const cleanAnswer = (body.answer || '').trim().toUpperCase();
    const letterCount = cleanAnswer.replace(/\s+/g, '').length;

    const rowData = {
      scheduled_date: body.scheduledDate,
      clue: (body.clue || '').trim(),
      answer: cleanAnswer,
      letter_count: letterCount,
      difficulty: body.difficulty || 'Medio',
      category: body.category || '',
      def_part: (body.defPart || '').trim(),
      mechanism_part: (body.mechanismPart || '').trim(),
      mechanism_text: (body.mechanismText || '').trim(),
      status: 'published',
    };

    if (body.id && !body.id.startsWith('cr-')) {
      // Actualizar existente
      const { data, error } = await supabase
        .from('cryptics')
        .update(rowData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(mapRowToCryptic(data));
    } else {
      // Insertar nuevo
      const { data, error } = await supabase
        .from('cryptics')
        .insert(rowData)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(mapRowToCryptic(data));
    }
  } catch (err) {
    console.error('Error en POST admin cryptics:', err);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}

// DELETE: Eliminar un críptico por ID (requiere autenticación de admin)
export async function DELETE(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Falta el parámetro ID' }, { status: 400 });
  }

  const { error } = await supabase.from('cryptics').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
