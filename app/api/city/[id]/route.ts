import { NextResponse } from "next/server";
import { getNetworkData, getCityDetail } from "@/lib/data/network";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { cities } = await getNetworkData();
  const city = cities.find((c) => c.id === params.id);
  if (!city) {
    return NextResponse.json({ error: "Unknown city" }, { status: 404 });
  }
  const detail = await getCityDetail(city);
  return NextResponse.json({
    featuredBuilders: detail.featuredBuilders,
    activeProjectsCount: detail.activeProjectsCount,
    upcomingSprintTitle: detail.upcomingSprintTitle,
    upcomingSprintHref: detail.upcomingSprintHref,
    coworkSession: detail.coworkSession,
    eventAttendeeCount: detail.eventAttendeeCount,
    topBadges: detail.topBadges,
  });
}
