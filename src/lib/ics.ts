import type { MeetingRow } from "@/lib/db";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function escapeIcsText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string) {
  // RFC 5545: linhas com mais de 75 octetos devem ser quebradas com CRLF + espaço
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function buildMeetingIcs(meeting: MeetingRow): string {
  const [year, month, day] = meeting.date.split("-").map(Number);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Clube de Pintura//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:encontro-${meeting.id}@clube-pintura`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]}Z`,
  ];

  if (meeting.time) {
    const [hour, minute] = meeting.time.split(":").map(Number);
    const start = new Date(year, month - 1, day, hour, minute);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const fmt = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
        d.getHours()
      )}${pad(d.getMinutes())}00`;

    lines.push(`DTSTART:${fmt(start)}`);
    lines.push(`DTEND:${fmt(end)}`);
  } else {
    const startStr = `${year}${pad(month)}${pad(day)}`;
    const endDate = new Date(year, month - 1, day + 1);
    const endStr = `${endDate.getFullYear()}${pad(
      endDate.getMonth() + 1
    )}${pad(endDate.getDate())}`;

    lines.push(`DTSTART;VALUE=DATE:${startStr}`);
    lines.push(`DTEND;VALUE=DATE:${endStr}`);
  }

  lines.push(`SUMMARY:${escapeIcsText("Encontro do Clube de Pintura")}`);

  if (meeting.location) {
    lines.push(`LOCATION:${escapeIcsText(meeting.location)}`);
  }
  if (meeting.notes) {
    lines.push(`DESCRIPTION:${escapeIcsText(meeting.notes)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
