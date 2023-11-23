"use client";

import { Fragment, useState } from 'react'
import { Dialog, Popover, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from 'classnames';

import { AddWalletModal } from '@/modals';

import { selectWalletAddress } from '@/store/slices/settingsSlice';
import { useSelector } from '@/store';

const more = [
  { name: 'About Obyte', href: 'https://obyte.org/', description: 'Running since 2016, Obyte is a distributed ledger based on directed acyclic graph (DAG).' },
  { name: 'Blog', href: 'https://blog.obyte.org/', description: 'Read our latest announcements and get perspectives from our team' },
]

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const walletAddress = useSelector(selectWalletAddress);
  const isWalletPersisted = useSelector((state) => state.settings.walletIsPersisted)
  const pathname = usePathname();

  return <header className="bg-white z-50">
    <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div className="flex lg:flex-1">
        <Link href="/" className="-m-1.5 p-1.5 flex space-x-3 items-center">
          <img className="h-8 w-auto" src="/logo.svg" alt="" />
          <div>
            <div className="text-gray-900 font-bold">Kivach</div>
            <div className="text-xs">Cascading donations</div>
          </div>
        </Link>
      </div>
      <div className="flex lg:hidden">
        <button
          type="button"
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <Popover.Group className="hidden lg:flex lg:gap-x-12">
        <Link href="/add" className={cn("text-sm font-semibold leading-6 text-gray-900", {"text-primary": pathname === "/add"})}>
          Add repo
        </Link>
        
        <Link href="/popular" className={cn("text-sm font-semibold leading-6 text-gray-900", {"text-primary": pathname === "/popular"})}>
          Popular
        </Link>

        <Link href="/donors" className={cn("text-sm font-semibold leading-6 text-gray-900", {"text-primary": pathname === "/donors"})}>
          Donors
        </Link>

        <Link href="/faq" className={cn("text-sm font-semibold leading-6 text-gray-900", {"text-primary": pathname === "/faq"})}>
          F.A.Q.
        </Link>

        <Popover className="relative">
          <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
            More
            <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-96 rounded-3xl bg-white p-4 shadow-lg ring-1 ring-gray-900/5">
              {more.map((item) => (
                <div key={item.name} className="relative rounded-lg p-4 hover:bg-gray-50">
                  <a href={item.href} target="_blank" rel="noopener" className="block text-sm font-semibold leading-6 text-gray-900">
                    {item.name}
                    <span className="absolute inset-0" />
                  </a>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                </div>
              ))}
            </Popover.Panel>
          </Transition>
        </Popover>
      </Popover.Group>
      <div className="hidden lg:flex lg:flex-1 lg:justify-end space-x-3 items-center">

        <div>
          <Link href="/settings" className={cn("text-sm font-semibold leading-6 text-gray-900", {"text-primary": pathname === "/settings"})}>
            My repos
          </Link>
        </div>

        <AddWalletModal />
      </div>
    </nav>
    <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
      <div className="fixed inset-0 z-10" />
      <Dialog.Panel className="fixed inset-y-0 right-0 z-10 flex w-full flex-col justify-between overflow-y-auto bg-white sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="-m-1.5 p-1.5 flex space-x-3 items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="" />
              <div>
                <div className="text-gray-900 font-bold">Kivach</div>
                <div className="text-xs">Cascading donations</div>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link href="/add" onClick={() => setMobileMenuOpen(false)} className={cn("group -mx-3 flex items-center gap-x-6 rounded-lg p-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50", {"text-primary": pathname === "/add"})}>
                  Add repo
                </Link>

                <Link href="/popular" onClick={() => setMobileMenuOpen(false)} className={cn("group -mx-3 flex items-center gap-x-6 rounded-lg p-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50", {"text-primary": pathname === "/popular"})}>
                  Popular
                </Link>

                <Link href="/donors" onClick={() => setMobileMenuOpen(false)} className={cn("group -mx-3 flex items-center gap-x-6 rounded-lg p-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50", {"text-primary": pathname === "/donors"})}>
                  Donors
                </Link>

                <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className={cn("group -mx-3 flex items-center gap-x-6 rounded-lg p-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50", {"text-primary": pathname === "/faq"})}>
                  F.A.Q.
                </Link>

                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className={cn("group -mx-3 flex items-center gap-x-6 rounded-lg p-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50", {"text-primary": pathname === "/settings"})}>
                  My repo
                </Link>
              </div>
              <div className="space-y-2 py-6">
                {more.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target='_blank'
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              {isWalletPersisted && <div className="py-6">
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  href={"?walletModal=1"}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  {walletAddress ? "Change wallet" : "Add wallet"}
                </Link>
              </div>}
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  </header>
}
