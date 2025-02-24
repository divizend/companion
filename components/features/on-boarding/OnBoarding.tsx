import React from 'react';

import { Icon } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, ImageBackground, ImageSourcePropType, Pressable, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

interface OnboardingViewProps {
  src: ImageSourcePropType;
  title: string;
  description?: string;
  button?: React.ReactNode;
}

export function OnboardingView({ src, title, description, button }: OnboardingViewProps) {
  const theme = useThemeColor();

  return (
    <>
      <ImageBackground
        source={src as ImageSourcePropType}
        imageStyle={{
          borderRadius: 16,
          objectFit: 'cover',
          width: '100%',
          position: 'absolute',
          top: -150,
          transform: [{ translateY: 150 }],
        }}
        style={{
          width: '65%',
          borderRadius: 16,
          marginBottom: 22,
          overflow: 'hidden',
          position: 'relative',
          aspectRatio: 3 / 4,
          marginHorizontal: 'auto',
        }}
      >
        {
          <LinearGradient
            colors={['transparent', theme.backgroundSecondary]}
            style={{ height: '100%', width: '100%' }}
          />
        }
      </ImageBackground>

      <Text h3 className="text-center font-bold">
        {title}
      </Text>

      {description && <Text className="text-center">{description}</Text>}

      {button}
    </>
  );
}

interface OnBoardingProps<T> {
  data: T[];
  render: (item: T) => React.ReactNode;
  onClose: () => void;
}

export default function OnBoarding<Datum extends {}>({ data, onClose, render: Render }: OnBoardingProps<Datum>) {
  const theme = useThemeColor();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({ count: index - progress.value, animated: true });
  };

  return (
    <View style={{ flex: 1, marginHorizontal: -20 }}>
      <Carousel
        ref={ref}
        width={width}
        height={height - 250}
        style={{ marginTop: -20 }}
        data={data}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <View
            className="shadow flex flex-col gap-2 p-5 pb-8"
            style={{
              flex: 1,
              margin: 20,
              borderRadius: 16,
              backgroundColor: theme.backgroundSecondary,
            }}
          >
            <Pressable
              className="rounded-full p-1 mb-3"
              style={{ backgroundColor: theme.backgroundPrimary, marginLeft: 'auto' }}
              onPress={onClose}
            >
              <Icon name="close" type="material" size={20} color={theme.text} />
            </Pressable>

            <Render {...item} />
          </View>
        )}
      />

      <Pagination.Custom
        progress={progress}
        data={data}
        size={25}
        onPress={onPressPagination}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          marginHorizontal: 5,
        }}
        activeDotStyle={{
          backgroundColor: theme.theme,
        }}
        containerStyle={{
          height: 10,
          alignItems: 'center',
          marginTop: 5,
        }}
      />
    </View>
  );
}
