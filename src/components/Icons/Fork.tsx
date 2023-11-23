import { FC } from 'react';
import cn from 'classnames';

import { IIconProps } from './interface';

export const ForkIcon: FC<IIconProps> = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" className={cn(className)}>
  <path fill="currentColor" d="M752 100c-61.8 0-112 50.2-112 112c0 47.7 29.9 88.5 72 104.6v27.6L512 601.4L312 344.2v-27.6c42.1-16.1 72-56.9 72-104.6c0-61.8-50.2-112-112-112s-112 50.2-112 112c0 50.6 33.8 93.5 80 107.3v34.4c0 9.7 3.3 19.3 9.3 27L476 672.3v33.6c-44.2 15-76 56.9-76 106.1c0 61.8 50.2 112 112 112s112-50.2 112-112c0-49.2-31.8-91-76-106.1v-33.6l226.7-291.6c6-7.7 9.3-17.3 9.3-27v-34.4c46.2-13.8 80-56.7 80-107.3c0-61.8-50.2-112-112-112zM224 212a48.01 48.01 0 0 1 96 0a48.01 48.01 0 0 1-96 0zm336 600a48.01 48.01 0 0 1-96 0a48.01 48.01 0 0 1 96 0zm192-552a48.01 48.01 0 0 1 0-96a48.01 48.01 0 0 1 0 96z" />
</svg>