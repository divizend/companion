import React, { useMemo, useState } from 'react';

import { SvgUri } from 'react-native-svg';

interface BankParentIconProps {
  bankParent?: string;
  size?: number;
}

export function BankParentIcon({ bankParent, size = 44 }: BankParentIconProps) {
  const [icon, setIcon] = useState<string>(bankParent?.endsWith('_UNKNOWN') ? 'UNKNOWN' : bankParent || 'UNKNOWN');

  const iconUri = useMemo(() => {
    return 'https://divizend.com' + iconPath(icon);
  }, [icon]);

  return (
    <SvgUri
      width={size}
      height={size}
      uri={iconUri}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
      }}
      onError={() => {
        setIcon('UNKNOWN');
      }}
    />
  );
}

const iconPath = (icon: string) => {
  return `/bank/${icon}.svg`;
};
