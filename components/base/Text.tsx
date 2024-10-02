import React from 'react';
import { Text as NativeText, TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

type Props = TextProps & {
  children: React.ReactNode;
  className?: string;
};

export function Text({ children, className, ...props }: Props) {
  return (
    <NativeText {...props} className={twMerge('dark:text-white text-slate-800', className)}>
      {children}
    </NativeText>
  );
}
