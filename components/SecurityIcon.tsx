import React, { useEffect, useState } from 'react';

import { Image } from 'react-native';

import { clsx } from '@/common/clsx';
import { usedConfig } from '@/common/config';

export interface SecurityIconProps extends React.ComponentProps<typeof Image> {
  isin: string;
  country: string;
}

const ACTOR_STATIC_URL = usedConfig.actorStaticUrl;

export default function SecurityIcon({ isin, country, className, ...rest }: SecurityIconProps) {
  const [src, setSrc] = useState<string>(`${ACTOR_STATIC_URL}/actor/logo/${isin}.png`);

  useEffect(() => {
    setSrc(`${ACTOR_STATIC_URL}/actor/logo/${isin}.png`);
  }, [isin]);

  return (
    <Image
      source={{ uri: src }}
      resizeMode="contain"
      className={clsx('rounded-md', className)}
      width={20}
      height={20}
      onError={() => {
        setSrc(`https://divizend.com/flags/${country.toUpperCase()}.png`);
      }}
      {...rest}
    />
  );
}
