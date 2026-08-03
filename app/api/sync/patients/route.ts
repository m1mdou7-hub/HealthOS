import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Get patients for offline sync
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');

    let query = (supabase as any)
      .from('healthos_patients')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (since) {
      query = query.gt('updated_at', since);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Patients sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
