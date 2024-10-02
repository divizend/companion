import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
};

export function Screen({ children }: Props) {
  return <SafeAreaView>{children}</SafeAreaView>;
}
