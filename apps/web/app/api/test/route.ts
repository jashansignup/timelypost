import { schedulePost } from "@/lib/upstash";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  schedulePost("Tesmp id ");
  return NextResponse.json({ message: "Hello" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const headers = req.headers;

  console.log(body);
  console.log(headers);
  return NextResponse.json({ message: "Hello" });
}
