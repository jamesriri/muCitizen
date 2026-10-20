import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/security";
import { Role } from "@/types";
import { CopilotService } from "@/features/copilot/services/copilot.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const role = session?.role || Role.CITIZEN;

    const body = await req.json();
    const message = body.message as string;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const reply = await CopilotService.generateCivicResponse(message, role);

    return NextResponse.json({
      reply,
      sender: "assistant",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred in the civic intelligence engine." },
      { status: 500 }
    );
  }
}
