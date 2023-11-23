"use client";

import cn from "classnames";
import { FC, ReactNode } from "react";

interface ICheckboxProps {
  label?: ReactNode;
  description?: ReactNode;
  name: string;
  className?: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: undefined;
}

export const Checkbox: FC<ICheckboxProps> = ({ label, name, checked, description = "", children, className = "", ...rest }) => <div className={cn(className, "relative flex items-center")}>
  <div className={cn("flex h-6 items-center")}>
    <input
      id={name}
      name={name}
      type="checkbox"
      checked={checked}
      {...rest}
      className={cn("h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary")}
    />
  </div>
  <div className="ml-3 text-sm leading-6">
    {label && <label htmlFor={name} className="font-medium text-gray-900">
      {label}
    </label>}{' '}
    {<span id="comments-description" className="text-gray-500">
      {label && <span className="sr-only">{label} </span>}{description}
    </span>}
  </div>
</div>