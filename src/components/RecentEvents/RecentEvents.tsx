import { FC } from 'react';
import cn from 'classnames';

import { getAvatarUrl } from '@/utils';
import { IRecentEvent } from '@/utils/responseToEvent';

interface IRecentEventProps {
  data: IRecentEvent[];
  first?: boolean;
}

export const RecentEvents: FC<IRecentEventProps> = ({ data, first = true }) => (<div className="flow-root">
  {data && data.length ? <ul role="list" className={cn({ "-mb-8": first })}>
    {data?.map(({ repository, time, message, link }, eventIdx) => (
      <li key={time + repository + eventIdx}>
        <div className="relative pb-8">
          {(eventIdx !== data.length - 1) ? (
            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
          ) : null}
          <div className="relative flex space-x-3">
            <div>
              <span
                className='h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
              >
                <img className="h-8 w-8 rounded-full" src={getAvatarUrl(repository.split("/")?.[0])} alt={``} />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
              <div>
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                <a href={link} target="_blank" rel="noopener">{time}</a>
              </div>
            </div>
          </div>
        </div>
      </li>
    ))}
  </ul> : <div className='text-gray-400 pb-8'>No events yet</div>}
</div>)
