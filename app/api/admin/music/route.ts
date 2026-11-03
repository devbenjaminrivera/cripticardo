import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { buildSpotifySearchUrl, getDefaultRecommendationForDate } from '@/lib/musicData';
import { getChileDateString } from '@/lib/dataService';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

// GET: Obtener todas las recomendaciones personalizadas o consultar una fecha
export async function GET(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get('date');

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 });
  }

  try {
    let query = supabase
      .from('daily_recommendations')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (targetDate) {
      query = query.eq('scheduled_date', targetDate);
      const { data, error } = await query.maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data) {
        return NextResponse.json({
          id: data.id,
          title: data.title,
          artist: data.artist,
          spotifyUrl: data.spotify_url,
          scheduledDate: data.scheduled_date,
          isCustom: true,
        });
      }

      // Si no hay personalizada para esa fecha, retorna la rotación por defecto
      return NextResponse.json(getDefaultRecommendationForDate(targetDate));
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        spotifyUrl: row.spotify_url,
        scheduledDate: row.scheduled_date,
        isCustom: true,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en servidor' }, { status: 500 });
  }
}

// POST: Crear o actualizar recomendación de una fecha
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
    const scheduledDate = (body.scheduledDate || getChileDateString()).trim();
    const title = (body.title || '').trim();
    const artist = (body.artist || '').trim();

    if (!title || !artist) {
      return NextResponse.json(
        { error: 'El título y el artista son obligatorios' },
        { status: 400 }
      );
    }

    // Si no se proporcionó URL de Spotify, autogenerar la de búsqueda
    const spotifyUrl = body.spotifyUrl && body.spotifyUrl.trim().length > 0
      ? body.spotifyUrl.trim()
      : buildSpotifySearchUrl(title, artist);

    const { data, error } = await supabase
      .from('daily_recommendations')
      .upsert(
        {
          scheduled_date: scheduledDate,
          title,
          artist,
          spotify_url: spotifyUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'scheduled_date' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      artist: data.artist,
      spotifyUrl: data.spotify_url,
      scheduledDate: data.scheduled_date,
      isCustom: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al guardar' }, { status: 500 });
  }
}

// DELETE: Eliminar recomendación personalizada para revertir a la rotación
export async function DELETE(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.valid) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get('date');

  if (!targetDate) {
    return NextResponse.json({ error: 'Falta parámetro date' }, { status: 400 });
  }

  const { error } = await supabase
    .from('daily_recommendations')
    .delete()
    .eq('scheduled_date', targetDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, revertedTo: getDefaultRecommendationForDate(targetDate) });
}
