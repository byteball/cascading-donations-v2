"use client";

import { Children, FC, ReactNode, cloneElement, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { isArray } from "lodash";
import cn from "classnames";
import { Img } from "react-image";

interface ISelectProps {
  label?: ReactNode;
  placeholder?: string;
  value: any;
  onChange?: (value: any) => void;
  className?: string;
  children: any;
  search?: boolean;
}

interface ISelect extends FC<ISelectProps> {
  Option: FC<IOptionProps>;
}

const Select: ISelect = ({ label, placeholder, children, value, onChange, className = "", search = true }) => {
  const [query, setQuery] = useState("");

  const filteredChildren =
    query === ""
      ? children
      : children.filter((item) => {
        return item.props.children.toLowerCase().includes(query.toLowerCase());
      });

  const activeChild = !search && value ? children.find((item: any) => item.props?.value === value) : null;

  return (
    <Combobox as="div" className={className} value={value} onChange={onChange}>
      {label && <Combobox.Label className="block text-sm font-medium text-gray-600 mb-1">{label}</Combobox.Label>}
      <div className="relative">
        {search ? <Combobox.Input
          // as={Fragment}
          className="w-full py-2 pl-3 pr-10 h-[40px] text-md bg-transparent  border-none ring-1 ring-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:text-md "
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(asset) => (isArray(children) ? children.find((item) => item.props?.value === asset)?.props?.children : children?.props?.children)}
          placeholder={placeholder}
          autoComplete="off"
        /> : <div className="list-none">
          <Combobox.Button className="w-full relative py-2 pl-3 pr-10 h-[40px] text-md bg-transparent  border-none ring-1 ring-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:text-md ">
            <div className="w-full items-center justify-start flex gap-2">
              {activeChild?.props?.iconUrl && <div><Img width={16} height={16} src={isArray(activeChild?.props?.iconUrl) ? [...activeChild?.props?.iconUrl, "/plug.svg"] : [activeChild?.props?.iconUrl, "/plug.svg"]} alt={""} /></div>}
              {activeChild?.props?.children ? activeChild.props.children : <div>{placeholder ?? ''}</div>}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-lg focus:outline-none">
              <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
          </Combobox.Button>
        </div>}

        {search && <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-lg focus:outline-none">
          <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>}

        <Combobox.Options className="absolute z-20 w-full py-1 mt-1 overflow-auto text-md bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-md">
          {filteredChildren.length > 0 ? (
            Children.toArray(filteredChildren).map((item, i) => cloneElement(item))
          ) : (
            <span className="py-2 pl-3 mb-1 text-primary-gray-light pr-9 text-md">No value</span>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export interface IOptionProps {
  value: any;
  children: any;
  disabled?: boolean;
  iconUrl?: string | string[];
}

const Option: FC<IOptionProps> = ({ value, children, iconUrl, disabled = false }) => (
  <Combobox.Option
    value={value}
    disabled={disabled}
    className={({ active, selected }) =>
      cn(
        "relative cursor-pointer select-none py-2 pl-3 pr-9",
        { "bg-primary text-white": selected },
        { "bg-gray-100": active },
        { "text-gray-900/20": !active && !selected && disabled },
        { "text-gray-900": !active && !selected && !disabled }
      )
    }
  >
    {({ active, selected }) => (
      <>
        <span className={cn("flex space-x-2 truncate", { "font-semibold": selected })}>
          {iconUrl && <Img width={16} height={16} src={isArray(iconUrl) ? [...iconUrl, "/plug.svg"] : [iconUrl, "/plug.svg"]} alt={""} />}
          <div>{children}</div>
        </span>

        {selected && (
          <span
            className={cn("absolute inset-y-0 right-0 flex items-center pr-4", { "text-white": active || selected }, { "text-primary": !active && !selected })}
          >
            <CheckIcon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
      </>
    )}
  </Combobox.Option>
);

Select.Option = Option;

export default Select;