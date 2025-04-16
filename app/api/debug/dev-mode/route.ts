import { NextResponse } from 'next/server';
import { getDevModeStatus } from '@/app/lib/dev-mode';

// Debug endpoint for development mode status
export async function GET(request: Request) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        error: 'Development mode debug endpoint is only available in development environment'
      }, { status: 403 });
    }
    
    // Get the current status of dev mode
    const status = getDevModeStatus();
    
    // Set environment variable
    if (typeof process.env.ENABLE_DEV_MODE === 'undefined') {
      process.env.ENABLE_DEV_MODE = 'true';
      console.log('[DEV MODE] Enabled development mode');
    }
    
    return NextResponse.json({
      success: true,
      status: {
        ...status,
        ENABLE_DEV_MODE: process.env.ENABLE_DEV_MODE
      },
      enableUrl: `/api/debug/dev-mode?enable=true`,
      disableUrl: `/api/debug/dev-mode?enable=false`
    });
  } catch (error) {
    console.error('Error in dev mode debug endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}

// Update development mode setting
export async function POST(request: Request) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        error: 'Development mode debug endpoint is only available in development environment'
      }, { status: 403 });
    }
    
    const data = await request.json();
    const enable = data.enable === true || data.enable === 'true';
    
    // Update the environment variable
    process.env.ENABLE_DEV_MODE = enable ? 'true' : 'false';
    
    return NextResponse.json({
      success: true,
      devModeEnabled: enable,
      message: `Development mode ${enable ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Error updating dev mode setting:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
