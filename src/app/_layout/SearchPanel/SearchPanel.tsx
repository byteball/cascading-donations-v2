import { ClipboardEventHandler, Fragment, useEffect, useRef, useState } from 'react';

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Combobox, Dialog, Transition } from '@headlessui/react'
import Tooltip from "rc-tooltip";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/rest";
import { debounce } from "lodash";
import cn from "classnames";
import { useRouter } from "next/navigation";

import { ISearchRepoItem } from "@/services/backend.server";
import { Spin } from "@/components";
import { getAvatarUrl } from "@/utils";

import appConfig from "@/appConfig";

export const SearchPanel = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchList, setSearchList] = useState<ISearchRepoItem[]>([]);
  const { data } = useSession();
  const router = useRouter();

  const keyDownHandler = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      setOpen((o) => !o)
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
    }
  });


  const search = async () => {
    const github = new Octokit({ auth: data?.access_token });

    const [owner, name] = query.split("/");
    let q = `${query} fork:true`;
    let result = [];

    if (!loading) return;

    try {
      console.log('log: search (user limit)');

      if (owner && name) {
        q = `${name} in:name user:${owner} fork:true`;
      }

      result = await github.request('GET /search/repositories', {
        q,
      }).then((result) => result.data.items.map((item) => ({ title: item.full_name, description: item.description || "No description" })));

      setSearchList(result || []);
      setLoading(false);
    } catch (e) {
      console.log('log: search (backend limit)', e);

      const res = await fetch(`${appConfig.BACKEND_API_URL}/search?q=${encodeURIComponent(query)}`) //.then(({ data }) => data?.data as ISearchRepoItem[]);

      result = await res.json().then(({ data }) => data as ISearchRepoItem[]);

      setSearchList(result || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query && !query.includes("https://")) {
      search();
    }

    setSearchList([]);
  }, [query]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setQuery(event.target.value);

    if (searchList.length) setSearchList([]);

    if (!loading) setLoading(true);
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    const fullName = inputRef.current?.value.replace("https://github.com/", "");

    if (ev.key === "Enter" && fullName && !searchList.length && fullName.split("/").length === 2) {
      setQuery('');
      ev.preventDefault();
      setOpen(false);

      setSearchList([]);
      setLoading(false);
      router.push("/repo/" + String(fullName).toLowerCase());
    }
  }

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (ev) => {
    const data = ev.clipboardData.getData("text/plain");

    if (data.startsWith("https://github.com/")) {
      const dataWithoutUrl = data.replace("https://github.com/", "");

      if (dataWithoutUrl.split("/").length === 2) {
        setOpen(false);
        setSearchList([]);
        setLoading(false);

        router.push("/repo/" + String(dataWithoutUrl).toLowerCase());
      }
    }
  }

  useEffect(() => {
    setSearchList([]);
    setLoading(false);
    setQuery('');
  }, [open])

  return <>
    <Tooltip
      placement="bottom"
      trigger={["hover"]}
      overlayClassName="max-w-[250px]"
      overlay={<span>Search for repos to donate to</span>}
    >
      <MagnifyingGlassIcon onClick={() => setOpen(true)} className="h-6 w-6 text-gray-900 cursor-pointer" />
    </Tooltip>


    <Transition.Root show={open} as={Fragment} afterLeave={() => {
      setQuery('');
      setSearchList([]);
      setLoading(false);
    }} appear>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-40">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox onChange={(obj: ISearchRepoItem) => { router.push("/repo/" + String(obj.title).toLowerCase()); setOpen(false) }}>
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    autoComplete="off"
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Repo name, e.g. bitcoin/bitcoin"
                    onChange={debounce(handleQueryChange, 800)}
                    onKeyDown={handleEnter}
                    onPaste={handlePaste}
                    ref={inputRef}
                  />
                </div>

                {searchList.length ? <Combobox.Options static className="max-h-96 transform-gpu scroll-py-3 overflow-y-auto p-2">
                  {searchList?.map((repo) => (
                    <Combobox.Option
                      key={repo.title}
                      value={repo}
                      className={({ active }) =>
                        cn(
                          'relative list-none cursor-pointer select-none py-3 px-3 pr-9 rounded-xl',
                          active ? 'bg-primary text-white' : 'text-gray-900'
                        )
                      }
                    >
                      {({ selected }) => ( // exist active
                        repo && <>
                          <div className="flex items-center">
                            <img src={getAvatarUrl(repo.title.split("/")?.[0])} alt="repo.title" className="h-6 w-6 flex-shrink-0 rounded-full" />
                            <span className={cn('ml-3 truncate', { 'font-semibold': selected })}>{repo.title}</span>
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options> : null}

                {query !== '' && searchList?.length === 0 && !loading && (
                  <p className="p-4 text-sm text-gray-500">No repo found.</p>
                )}

                {loading && query !== '' && !query.startsWith("https://") && <div className="p-4 flex justify-center">
                  <Spin />
                </div>}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  </>
}