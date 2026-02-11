import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Check if credentials are loaded
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials not loaded',
        debug: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 })
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

    // Test connection by fetching tables
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Supabase',
        details: tablesError.message,
        credentials: {
          url: supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 })
    }

    // Get all table information
    const { data: queries, error: queriesError } = await supabase
      .from('queries')
      .select('*')
      .limit(5)

    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Supabase connected successfully',
      credentials: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey
      },
      data: {
        users: tables || [],
        queries: queries || [],
        organizations: organizations || [],
        queriesError: queriesError?.message,
        orgsError: orgsError?.message
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
