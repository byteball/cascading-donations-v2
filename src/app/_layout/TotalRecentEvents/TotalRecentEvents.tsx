"use server";

import { RecentEvents } from "@/components";
import { RecentEventsPagination } from "@/components/RecentEventsPagination/RecentEventsPagination";
import { getTotalRecentEvents } from "@/services/backend.server";

export const TotalRecentEvents = async () => {
  const { events, pagination } = await getTotalRecentEvents(1);

  return <div>
    <RecentEvents data={events || []} />

    <RecentEventsPagination
      totalPage={Number(pagination?.total_pages)}
      className="mt-6"
    />

  </div>
}