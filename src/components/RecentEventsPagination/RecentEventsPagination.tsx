"use client";

import { FC, useEffect, useState } from "react";
import cn from "classnames";
import { useRouter } from "next/navigation";

import { Button, RecentEvents } from "..";
import { responseToEvent } from "@/utils/responseToEvent";
import appConfig from "@/appConfig";

interface IRecentEventsPaginationProps {
  totalPage: number;
  className?: string;
}

const getRecentEvents = async (page: number) => {
  const responses = await fetch(`${appConfig.BACKEND_API_URL}/recent/${page}`);
  const data = await responses.json();

  const events = await responseToEvent(data.data);

  return { events, pagination: data.pagination };
}


export const RecentEventsPagination: FC<IRecentEventsPaginationProps> = ({ className = "", totalPage = 0 }) => {
  // const router = useRouter();
  const [page, setPage] = useState(0);
  const [events, setEvents] = useState<[]>([])


  useEffect(() => {

    if (page > 0) {
      getRecentEvents(page + 1).then((data) => {
        setEvents(e => {
          return [...e, ...data.events]
        });
      });
    }
  }, [page]);

  return <>
    {page !== 0 && events.length ? <div className="mt-8"><RecentEvents first={false} data={events} /> </div> : null}

    {totalPage > page && <div className={cn(className)}>
      <Button type="default" onClick={() => setPage(p => p + 1)} >Load more</Button>
    </div>}
  </>
}