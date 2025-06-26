import React, { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Pressable, Text } from 'react-native';

import { clsx } from '@/common/clsx';
import { useThemeColor } from '@/hooks/useThemeColor';

export type CopyableStringProps = {
  children: string;
  maxLength?: number;
  crop?: 'start' | 'middle' | 'end';
};

export default function CopyableString({ children, maxLength, crop }: CopyableStringProps) {
  const theme = useThemeColor();
  const [copied, setCopied] = useState(false);
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    return () => {
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }, [resetTimeout]);

  if (!children || typeof children !== 'string') return null;

  let displayText = children;
  let isTrimmed = false;

  if (maxLength !== undefined && children.length > maxLength) {
    if (maxLength === 0) {
      displayText = '';
    } else {
      if (crop === 'start') {
        displayText = `…${children.slice(-maxLength + 1)}`;
      } else if (crop === 'middle') {
        const half = Math.floor(maxLength / 2);
        const leftLength = half;
        const rightLength = maxLength % 2 === 0 ? half - 1 : half;
        displayText = `${children.slice(0, leftLength)}…${children.slice(-rightLength)}`;
      } else {
        // cropping at the end is the default
        displayText = `${children.slice(0, maxLength - 1)}…`;
      }
    }
    isTrimmed = true;
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(children);
    setCopied(true);

    if (resetTimeout) clearTimeout(resetTimeout);
    setResetTimeout(
      setTimeout(() => {
        setCopied(false);
        setResetTimeout(null);
      }, 2000),
    );
  };

  return (
    <Pressable
      onPress={handleCopy}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={clsx('flex-row items-center rounded-md gap-1 p-2', isPressed ? 'bg-gray-100 dark:bg-gray-800' : '')}
    >
      <Text
        className={`font-mono text-sm ${
          isPressed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
        }`}
        numberOfLines={1}
      >
        {displayText}
      </Text>
      <Ionicons
        name={copied ? 'checkmark' : 'copy-outline'}
        size={16}
        color={copied ? theme.tint : theme.muted}
        className="ml-1"
      />
    </Pressable>
  );
}
