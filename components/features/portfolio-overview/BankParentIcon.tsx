import React, { useState } from 'react';

import { Image, StyleSheet } from 'react-native';

interface BankParentIconProps {
  bankParent?: string;
  size?: number;
}

export function BankParentIcon({ bankParent, size = 44 }: BankParentIconProps) {
  const [icon, setIcon] = useState<string>(bankParent?.endsWith('_UNKNOWN') ? 'UNKNOWN' : bankParent || 'UNKNOWN');

  return (
    <Image
      source={{ uri: `${iconPath(icon)}` }}
      style={[styles.icon, { width: size, height: size }]}
      onError={() => setIcon('UNKNOWN')}
    />
  );
}

const iconPath = (icon: string) => {
  return `static/bank/${icon}.svg`;
};

const styles = StyleSheet.create({
  icon: {
    borderRadius: 4,
    marginHorizontal: 8,
  },
});
