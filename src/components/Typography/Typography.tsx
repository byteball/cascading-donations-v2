import cn from 'classnames';
import { FC } from 'react';

import { ITitleProps } from './interfaces';

interface IStyles {
  [level: number]: string;
}

const titleStyles: IStyles = {
  1: "text-4xl sm:text-6xl",
  2: "text-3xl sm:text-4xl",
  3: "text-2xl sm:text-3xl",
}

export const Title: FC<ITitleProps> = ({ level, displayAsLevel, children, className = "" }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag className={cn("text-gray-900 font-bold", titleStyles[displayAsLevel || level] || "", className)}>{children}</Tag>
}

const subTitleStyles: IStyles = {
  1: "text-lg leading-8 sm:max-w-md lg:max-w-4xl",
  2: "text-[18px] leading-6 sm:max-w-md lg:max-w-2xl",
}

export const SubTitle : FC<ITitleProps> = ({ level, children, className = "" }) => {
  return <p className={cn("text-gray-600 relative", subTitleStyles[level] || "", className)}>
    {children}
  </p>
}