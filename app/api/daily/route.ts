import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getChileDateString, mapRowToCryptic } from '@/lib/dataService';


export async function GET() {
  try {
    if (!supabase) {
      console.warn('API /api/daily: Supabase no está configurado en el servidor.');
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    }

    const chileDate = getChileDateString();

    // 1. Buscar críptico exactamente para hoy en Chile
    const { data: exactMatch, error: exactError } = await supabase
      .from('cryptics')
      .select('*')
      .eq('scheduled_date', chileDate)
      .eq('status', 'published')
      .maybeSingle();

    if (exactMatch) {
      return NextResponse.json(mapRowToCryptic(exactMatch));
    }

    if (exactError) {
      console.warn('Error al buscar críptico exacto:', exactError);
    }

    // 2. Si no hay para hoy, buscar todos los publicados
    const { data: allPublished, error: allError } = await supabase
      .from('cryptics')
      .select('*')
      .eq('status', 'published')
      .order('clue_number', { ascending: true });

    if (allError) {
      console.error('Error al consultar cryptics publicados:', allError);
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    if (allPublished && allPublished.length > 0) {
      const mapped = allPublished.map(mapRowToCryptic);

      // Algoritmo de rotación condicional
      const earliestDateStr = mapped[0].scheduledDate;
      const [tYear, tMonth, tDay] = chileDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = earliestDateStr.split('-').map(Number);

      const todayUtc = Date.UTC(tYear, tMonth - 1, tDay);
      const earliestUtc = Date.UTC(eYear, eMonth - 1, eDay);
      const dayDifference = Math.floor((todayUtc - earliestUtc) / (1000 * 60 * 60 * 24));

      if (dayDifference <= 0) {
        return NextResponse.json(mapped[0]);
      }

      return NextResponse.json(mapped[dayDifference % mapped.length]);
    }

    // 3. Si no hay ninguno publicado, retornar null
    return NextResponse.json(null);
  } catch (err) {
    console.error('Excepción en /api/daily:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
