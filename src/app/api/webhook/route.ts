import { NextRequest, NextResponse  } from "next/server";
import { handleUpdate } from "@/lib/bot-command";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("=== INCOMING TELEGRAM WEBHOOK ===");
    console.log(JSON.stringify(update, null, 2));
    
    await handleUpdate(update);
    
    console.log("=== WEBHOOK PROCESSED SUCCESSFULLY ===");
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('=== ERROR HANDLING TELEGRAM WEBHOOK ===');
    console.error(error);
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}