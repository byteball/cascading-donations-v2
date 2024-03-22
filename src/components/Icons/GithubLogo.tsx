import { FC } from 'react';
import cn from 'classnames';

import { IIconProps } from './interface';

export const GithubLogoIcon: FC<IIconProps> = ({ className = "", fill = "#ffffff" }) => <svg className={cn(className)} viewBox="0,0,256,256">
  <g fill={fill} fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt"
    strokeLinejoin="miter" stroke-miterlimit="10" strokeDasharray="" strokeDashoffset="0">
    <g transform="scale(10.66667,10.66667)">
      <path
        d="M10.9,2.1c-4.6,0.5 -8.3,4.2 -8.8,8.7c-0.6,5 2.5,9.3 6.9,10.7v-2.3c0,0 -0.4,0.1 -0.9,0.1c-1.4,0 -2,-1.2 -2.1,-1.9c-0.1,-0.4 -0.3,-0.7 -0.6,-1c-0.3,-0.1 -0.4,-0.1 -0.4,-0.2c0,-0.2 0.3,-0.2 0.4,-0.2c0.6,0 1.1,0.7 1.3,1c0.5,0.8 1.1,1 1.4,1c0.4,0 0.7,-0.1 0.9,-0.2c0.1,-0.7 0.4,-1.4 1,-1.8c-2.3,-0.5 -4,-1.8 -4,-4c0,-1.1 0.5,-2.2 1.2,-3c-0.1,-0.2 -0.2,-0.7 -0.2,-1.4c0,-0.4 0,-1 0.3,-1.6c0,0 1.4,0 2.8,1.3c0.5,-0.2 1.2,-0.3 1.9,-0.3c0.7,0 1.4,0.1 2,0.3c1.3,-1.3 2.8,-1.3 2.8,-1.3c0.2,0.6 0.2,1.2 0.2,1.6c0,0.8 -0.1,1.2 -0.2,1.4c0.7,0.8 1.2,1.8 1.2,3c0,2.2 -1.7,3.5 -4,4c0.6,0.5 1,1.4 1,2.3v3.3c4.1,-1.3 7,-5.1 7,-9.5c0,-6 -5.1,-10.7 -11.1,-10z"></path>
    </g>
  </g>
</svg>
