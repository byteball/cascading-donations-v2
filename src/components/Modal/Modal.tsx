"use client";

import { FC, Fragment, cloneElement, forwardRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import cn from "classnames";

interface IModal {
  children: React.ReactNode;
  trigger: React.ReactElement;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  advice?: React.ReactNode;
  wrapClassName?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Modal: FC<IModal> = forwardRef<HTMLDivElement, IModal>(
  ({
    children,
    title,
    trigger,
    subtitle,
    advice,
    isOpen = false,
    wrapClassName = "",
    setIsOpen
  }, ref) => {
    return (<>
      {cloneElement(trigger, { onClick: () => setIsOpen(true), ref })}

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative h-full z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed min-h-full inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex items-center h-full justify-center p-4 box-border text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className={cn("relative transform text-left transition-all my-10 sm:my-8 sm:w-full sm:max-w-2xl", wrapClassName)}>
                  <div className={cn("bg-white py-8 px-6 rounded-xl w-full")}>
                    <div className="mt-3 sm:mt-0 sm:text-left w-full">
                      {title && <Dialog.Title as="h2" className={cn("text-3xl font-semibold leading-10 text-gray-900", subtitle ? "mb-4" : "mb-8")}>
                        {title}
                      </Dialog.Title>}

                      {subtitle && <div className='mt-0 text-sm text-gray-600 font-normal mb-4'>{subtitle}</div>}

                      <div className="mt-2">
                        <div className="text-sm text-gray-950">
                          {children}
                        </div>
                      </div>
                    </div>

                    {advice && <div className='text-sm mt-8 text-gray-600'>
                      {advice}
                    </div>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>)
  }
);