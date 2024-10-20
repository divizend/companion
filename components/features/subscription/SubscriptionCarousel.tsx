import React, { useState } from 'react';

import { Dimensions, ImageBackground, Pressable, View } from 'react-native';
import Purchases, { PurchasesStoreProduct } from 'react-native-purchases';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { clsx } from '@/common/clsx';
import StyledButton from '@/components/StyledButton';
import { Text } from '@/components/base';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

type Props = { close: () => void };

export default function SubscriptionCarousel({ close }: Props) {
  const theme = useThemeColor();
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
            <ImageBackground
              alt="background-bubbles"
              className="flex-1 m-2 rounded-xl"
              imageStyle={{ opacity: 0.3 }}
              source={require('@/assets/images/card-background.png')}
            >
              <View
                key={item.identifier}
                className={clsx(
                  'flex-1 flex flex-row dark:bg-transparent border border-gray-200 rounded-xl justify-between p-6',
                  item.identifier === selectedItem?.identifier &&
                    'border-theme border-2 bg-[#3939ff1a] dark:bg-[#3939ff1a]',
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
                    {item.priceString}
                  </Text>
                  <Text className="text-end">{item.subscriptionPeriod}</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
      />

      <StyledButton
        disabled={!selectedItem}
        onPress={() => selectedItem && Purchases.purchaseStoreProduct(selectedItem, null)}
        title={
          <Text
            style={{
              textAlign: 'center',
              color: theme.allColors.dark.text,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            {t('subscription.getStarted')}
          </Text>
        }
        containerStyle={{ borderRadius: 12, width: '85%', alignSelf: 'center' }}
        buttonStyle={{ backgroundColor: theme.theme }}
      />
    </View>
  );
}
