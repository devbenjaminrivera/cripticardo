import { NextRequest, NextResponse, connection } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getChileDateString } from '@/lib/dataService';
import { getDefaultRecommendationForDate } from '@/lib/musicData';

export async function GET(request: NextRequest) {
  await connection();
  try {
    const targetDate = request.nextUrl.searchParams.get('date') || getChileDateString();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('daily_recommendations')
          .select('*')
          .eq('scheduled_date', targetDate)
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json({
            id: data.id,
            title: data.title,
            artist: data.artist,
            spotifyUrl: data.spotify_url,
            scheduledDate: data.scheduled_date,
            isCustom: true,
          });
        }
      } catch (err) {
        console.warn('daily_recommendations table check failed, falling back to rotation:', err);
      }
    }

    // Si no hay personalizada o no existe la tabla, retornamos la rotación automática
    const fallback = getDefaultRecommendationForDate(targetDate);
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Error fetching today recommendation:', error);
    const fallback = getDefaultRecommendationForDate();
    return NextResponse.json(fallback);
  }
}
