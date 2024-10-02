import React from 'react';
import { Text as NativeText, TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

const typeStyles = {
  default: 'dark:text-white text-slate-800',
  muted: 'dark:text-gray-400 text-gray-500',
  success: 'dark:text-green-400 text-green-600',
  error: 'dark:text-red-400 text-red-600',
  danger: 'dark:text-red-400 text-red-600',
  info: 'dark:text-blue-400 text-blue-600',
};

type Props = TextProps & {
  children: React.ReactNode;
  className?: string;
  type?: keyof typeof typeStyles;
};

export function Text({ children, className, type = 'default', ...props }: Props) {
  return (
    <NativeText {...props} className={twMerge(typeStyles[type], className)}>
      {children}
    </NativeText>
  );
}
