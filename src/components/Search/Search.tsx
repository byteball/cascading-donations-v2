"use client"

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Combobox } from '@headlessui/react';
import { ClipboardEventHandler, FC, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { debounce } from 'lodash';
import { Octokit } from "@octokit/rest";
import { useSession } from 'next-auth/react';

import { getAvatarUrl } from '@/utils';
import { ISearchRepoItem } from '@/services/backend.server';
import appConfig from '@/appConfig';

interface ISearchProps {
  placeholder?: string;
  className?: string;
  value?: string | null;
  forcedSelection?: boolean;
  showSearchIcon?: boolean;
  size?: "default" | "large";
  error?: boolean | string;
  type?: "default" | "primary";
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const Search: FC<ISearchProps> = ({ placeholder, className, size = "default", type = "default", value = null, error, showSearchIcon = false, onChange, onKeyDown, forcedSelection = false }) => {
  const [query, setQuery] = useState('');
  const [searchList, setSearchList] = useState<ISearchRepoItem[]>([]);
  const { data } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    const github = new Octokit({ auth: data?.access_token });

    const [owner, name] = query.split("/");
    let q = `${query} fork:true`;
    let result = [];

    try {
      console.log('log: search (user limit)');

      if (owner && name) {
        q = `${name} in:name user:${owner} fork:true`;
      }

      result = await github.request('GET /search/repositories', {
        q,
      }).then((result) => result.data.items.map((item) => ({ title: item.full_name, description: item.description || "No description" })));

      setSearchList(result);
    } catch (e) {
      console.log('log: search (backend limit)', e);

      const res = await fetch(`${appConfig.BACKEND_API_URL}/search?q=${encodeURIComponent(query)}`) //.then(({ data }) => data?.data as ISearchRepoItem[]);

      result = await res.json().then(({ data }) => data as ISearchRepoItem[]);

      setSearchList(result);
    }
  };

  useEffect(() => {
    if (query && !query.includes("https://") ) {
      search();
    }
  }, [query]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    const fullName = inputRef.current?.value.replace("https://github.com/", "");

    if (ev.key === "Enter" && fullName && !searchList.length && fullName.split("/").length === 2) {
      setQuery('');
      ev.preventDefault();
      setSearchList([]);
      onChange && onChange(String(fullName).toLowerCase());
    }
  }

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (ev) => {
    const data = ev.clipboardData.getData("text/plain");

    if (data.startsWith("https://github.com/")) {
      const dataWithoutUrl = data.replace("https://github.com/", "");

      if (dataWithoutUrl.split("/").length === 2) {
        setQuery('');
        setSearchList([]);

        onChange && onChange(String(dataWithoutUrl).toLowerCase());
      }
    }
  }

  return <Combobox as="div" className={cn("w-full", className)} value={value} onChange={(obj: ISearchRepoItem) => {
    onChange && onChange(obj.title);
  }}>
    <div className="relative">
      {showSearchIcon && <div className="absolute inset-y-0 left-0 flex items-center rounded-r-md px-2 focus:outline-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" arias-hidden="true" />
      </div>}

      <Combobox.Input
        autoComplete="off"
        onKeyDown={(ev) => {
          onKeyDown && onKeyDown(ev);
          forcedSelection && handleEnter(ev);
        }}
        ref={inputRef}
        placeholder={placeholder}
        className={cn({ "pl-8": showSearchIcon }, "w-full h-[40px] rounded-md border-0 bg-white py-2 px-4 text-gray-900 shadow-sm ring-1  ring-gray-300 focus:ring-2 sm:leading-6", size === "large" ? "py-3 text-md" : "text-sm ", { "ring-primary ring-2": type === "primary" }, { "ring-red-500": error })}
        onChange={debounce(handleQueryChange, 800)}
        onPaste={handlePaste}
      />


      {searchList.length > 0 && (
        <Combobox.Options className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-gray-950 ring-opacity-5 focus:outline-none sm:text-sm border-primary border">
          {searchList.map((repo) => (
            <Combobox.Option
              key={repo.title}
              value={repo}
              className={({ active }) =>
                cn(
                  'relative cursor-pointer select-none py-2 pl-3 pr-9',
                  active ? 'bg-primary text-white' : 'text-gray-900'
                )
              }
            >
              {({ selected }) => ( // exist active
                repo && <>
                  <div className="flex items-center">
                    <img src={getAvatarUrl(repo.title.split("/")?.[0])} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                    <span className={cn('ml-3 truncate', { 'font-semibold': selected })}>{repo.title}</span>
                  </div>
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      )}
    </div>
  </Combobox>
}
