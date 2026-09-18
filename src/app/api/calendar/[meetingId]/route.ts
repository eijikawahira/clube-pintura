import { NextResponse } from "next/server";
import { db, type MeetingRow } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { buildMeetingIcs } from "@/lib/ics";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  await requireUser();

  const { meetingId } = await params;
  const meeting = db
    .prepare("SELECT * FROM meetings WHERE id = ?")
    .get(Number(meetingId)) as MeetingRow | undefined;

  if (!meeting) {
    return NextResponse.json(
      { error: "Encontro não encontrado." },
      { status: 404 }
    );
  }

  const ics = buildMeetingIcs(meeting);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="encontro-${meeting.id}.ics"`,
    },
  });
}
