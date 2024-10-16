import React, { useEffect, useState } from 'react';

import { Dimensions, Pressable, View } from 'react-native';
import { PurchasesStoreProduct } from 'react-native-purchases';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { clsx } from '@/common/clsx';
import SectionList from '@/components/SectionList';
import { Text } from '@/components/base';
import { usePurchases } from '@/hooks/usePurchases';
import { t } from '@/i18n';

type Props = { close: () => void };

export default function SubscriptionCarousel({ close }: Props) {
  const { loading, products } = usePurchases();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [selectedItem, setSelectedItem] = useState<PurchasesStoreProduct>();

  if (loading || !products) return null;

  return (
    <View>
      <Text h1 className="text-center">
        {t('subscription.choosePlan')}
      </Text>
      <Carousel
        ref={ref}
        width={Dimensions.get('window').width}
        height={(Dimensions.get('window').width - 40) / 2}
        data={products}
        loop={false}
        mode="parallax"
        style={{ marginLeft: -20, marginRight: -20 }}
        modeConfig={{}}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <Pressable className="flex-1" onPress={() => setSelectedItem(item)}>
            <View
              key={item.identifier}
              className={clsx(
                'flex-1 flex flex-row bg-secondary-light dark:bg-transparent border border-gray-200 justify-between p-6 m-2 rounded-xl shadow-sm',
                item.identifier === selectedItem?.identifier &&
                  'border-theme border-2 bg-[#3939ff1a] dark:bg-[#3939ff1a] shadow-none',
              )}
            >
              <View className="flex justify-between">
                <Text h2 className="font-bold mb-2">
                  {item.title}
                </Text>
                <Text type="muted" className="mb-2 max-w-[80%]">
                  {item.description}
                </Text>
                <Text type="muted" className="mb-2 max-w-[80%]">
                  Cancel anytime
                </Text>
              </View>
              <View>
                <Text className="text-end" h3>
                  {item.pricePerMonthString}
                </Text>
                <Text className="text-end">{item.subscriptionPeriod}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
      <SectionList
        items={[
          {
            title: t('common.next'),
            disabled: !selectedItem,
            onPress: () => {},
          },
          {
            title: t('common.cancel'),
            onPress: () => close(),
          },
        ]}
      />
    </View>
  );
}
