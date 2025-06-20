import React from 'react';

import { Text as NativeText, TextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { clsx } from '@/common/clsx';

const typeStyles = {
  default: 'dark:text-white text-slate-800',
  muted: 'dark:text-gray-400 text-gray-500',
  success: 'dark:text-green-400 text-green-600',
  error: 'dark:text-red-400 text-red-600',
  danger: 'dark:text-red-400 text-red-600',
  info: 'dark:text-blue-400 text-blue-600',
};

type Props = TextProps & {
  children?: React.ReactNode;
  className?: string;
  type?: keyof typeof typeStyles;
  h1?: boolean;
  h2?: boolean;
  h3?: boolean;
  h4?: boolean;
  animated?: boolean;
};

export function Text({ children, className, type = 'default', h1, h2, h3, h4, animated, ...props }: Props) {
  const TextComponent = animated ? Animated.Text : NativeText;

  return (
    <TextComponent
      {...props}
      className={clsx(
        typeStyles[type],
        h1 && 'text-[28px] font-bold',
        h2 && 'text-[24px] font-semibold',
        h3 && 'text-[20px] font-medium',
        h4 && 'text-[16px] font-medium',
        className,
      )}
    >
      {children}
    </TextComponent>
  );
}
