import React from 'react';

import { TextInput as NativeTextInput, Platform, TextInputProps } from 'react-native';

import { clsx } from '@/common/clsx';

type Props = TextInputProps & { component?: React.ComponentType<any> };

export function TextInput({ component, ...textInputProps }: Props) {
  const Component = component ?? NativeTextInput;
  return (
    <Component
      placeholderTextColor="gray"
      {...textInputProps}
      className={clsx(
        'bg-secondary-light dark:bg-secondary-dark dark:text-white text-slate-800 border-1 color rounded-xl border-gray-300 px-4 py-2',
        Platform.OS === 'ios' && 'h-12',
        textInputProps.className,
      )}
    />
  );
}
