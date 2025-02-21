import React, { useMemo, useState } from 'react';

import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { useThemeColor } from '@/hooks/useThemeColor';

interface BankParentIconProps {
  bankParent?: string;
  size?: number;
}

export function BankParentIcon({ bankParent, size = 44 }: BankParentIconProps) {
  const [icon, setIcon] = useState<string>(bankParent?.endsWith('_UNKNOWN') ? 'UNKNOWN' : bankParent || 'UNKNOWN');
  const theme = useThemeColor();

  const iconUri = useMemo(() => {
    return 'https://divizend.com' + iconPath(icon);
  }, [icon]);

  return (
    <View style={{ width: size, height: size, backgroundColor: theme.theme, borderRadius: 8, overflow: 'hidden' }}>
      <SvgUri
        width={size}
        height={size}
        uri={iconUri}
        onError={() => {
          setIcon('UNKNOWN');
        }}
      />
    </View>
  );
}

const iconPath = (icon: string) => {
  return `/bank/${icon}.svg`;
};
