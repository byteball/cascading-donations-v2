import { forwardRef, ReactNode } from "react";

import { Spin } from "..";

interface IStylesByType {
  [type: string]: string;
}

const stylesByType: IStylesByType = {
  primary: "text-white bg-primary hover:bg-primary/75",
  default: "text-white bg-gray-950 hover:bg-primary-gray-light",
  danger: "text-white bg-red-700 hover:bg-red-900",
  text: "text-white p-0 m-0 leading-none",
  "text-primary": "text-primary hover:text-primary/75 p-0 m-0",
  light: "text-gray-700 bg-white hover:bg-gray-50 shadow-sm ring-1 ring-gray-300",
  metamask: "text-white bg-metamask hover:bg-metamask/75",
  disabled: "cursor-not-allowed bg-gray-950/50 text-white/70 pointer-events-none",
  "text-disabled": "cursor-not-allowed text-white/20 bg-transparent pointer-events-none leading-none",
};

export interface IButtonProps {
  children: any;
  type?: string & keyof IStylesByType;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  dashed?: boolean;
  loading?: boolean;
  block?: boolean;
  href?: string;
  fluid?: boolean;
  onClick?: () => void;
}

export const Button = forwardRef<any, IButtonProps>(
  ({ children, type = "default", icon = null, disabled = false, className = "", block, href, fluid, loading = false, dashed = false, ...rest }, ref) => {
    const commonStyles = `select-none	
    cursor-pointer
    hover:transition-all
    hover:duration-500
    inline-flex
    h-[40px]
    items-center
    ${type.startsWith("text") ? "px-0" : "px-4"}
    ${type.startsWith("text") ? "py-0" : "py-2"}
    text-base
    border
    border-transparent
    font-normal
    rounded-lg
    focus:outline-none
    ${fluid ? "w-full justify-center" : ""}
    ${dashed ? "ring-dashed" : ""}
    ${stylesByType[disabled || loading ? (type.startsWith("text") ? "text-disabled" : "disabled") : type] || ""} ${className} ${block ? "w-full justify-center" : ""}
  `;

  
    if (href !== undefined)
      return (
        <a ref={ref} className={commonStyles} onClick={rest.onClick} href={href}>
          {loading ? <Spin className="sepia opacity-40" size="small"/> : icon} {children}
        </a>
      );

    return (
      <button ref={ref} {...rest} disabled={disabled || loading} type="button" className={commonStyles}>
         {loading ? <Spin className="sepia opacity-40" size="small"/> : icon} {children}
      </button>
    );
  }
);