import { NextRequest, NextResponse  } from "next/server";
import { handleUpdate } from "@/lib/bot-command";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    await handleUpdate(update);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Telegram update:', error);
    return NextResponse.json({ ok:true})
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}