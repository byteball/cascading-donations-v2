"use client";

import { Children, FC, ReactComponentElement, cloneElement } from "react";
import cn from "classnames";

interface ITabsProps {
  children: ReactComponentElement<typeof Item> | ReactComponentElement<typeof Item>[];
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

interface ITabs<T> extends FC<T> {
  Item: FC<IItemProps>;
}

const Tabs: ITabs<ITabsProps> = ({ value, children, onChange, className = "" }) => (
  <div>
    <div className={cn("border-b border-gray-100 pb-2", className)}>
      <nav className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0" aria-label="Tabs">
        {Children.toArray(children).map((item: any) => cloneElement(item, { current: value === item.props.value, onChange: () => { onChange(item.props.value) } }))}
      </nav>
    </div>
  </div>)

interface IItemProps {
  children?: string;
  value?: any;
  current?: boolean;
  onChange?: (value: any) => void;
}

const Item: FC<IItemProps> = ({ children, value, current, onChange = () => { } }) => (<button
  key={children}
  onClick={() => onChange(value)}
  className={cn(
    current ? 'bg-gray-100 text-gray-950 font-semibold' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
    'rounded-md px-3 py-2 text-sm font-medium'
  )}
>
  {children}
</button>);

Tabs.Item = Item;

export default Tabs;