import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

interface SyncPayload {
  table: string;
  action: string;
  id: string;
  data: any;
}

/**
 * Handle sync requests from offline-capable clients
 */
export async function POST(req: NextRequest) {
  try {
    const payload: SyncPayload = await req.json();
    const { table, action, id, data } = payload;

    const supabase = createClient();

    // Map table names to database tables
    const tableMap: Record<string, string> = {
      patients: 'healthos_patients',
      appointments: 'healthos_appointments'
    };

    const dbTable = tableMap[table];
    if (!dbTable) {
      return NextResponse.json(
        { success: false, error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Handle upsert
    if (action === 'upsert') {
      const { error } = await supabase
        .from(dbTable)
        .upsert({
          ...data,
          id: id,
          synced_at: new Date().toISOString()
        });

      if (error) {
        console.error(`Sync error for ${table}:`, error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    // Handle delete
    if (action === 'delete') {
      const { error } = await supabase
        .from(dbTable)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Delete sync error for ${table}:`, error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      synced: { table, id, action }
    });
  } catch (error: any) {
    console.error('Sync endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get patients for sync
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get last sync time from query params
    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');

    let query = supabase
      .from('healthos_patients')
      .select('*')
      .order('updated_at', { ascending: false });

    if (since) {
      query = query.gte('updated_at', since);
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
