import React, { useLayoutEffect } from 'react';

import { ListItemChevron } from '@rneui/base/dist/ListItem/ListItem.Chevron';
import { Divider } from '@rneui/themed';
import { Pressable, View } from 'react-native';
import Animated, {
  SharedValue,
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { clsx } from '@/common/clsx';

import { Text } from './Text';

export type Props = {
  title: string;
  content: React.ReactNode;
  className?: string;
  initiallyOpen?: boolean;
  unitedBackground?: boolean;
};

export type NestedItem = {
  title: string;
  content: string[];
};

type ChevronProps = {
  progress: Readonly<SharedValue<0 | 1>>;
};

const Chevron = ({ progress }: ChevronProps) => {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * +90}deg` }],
  }));
  return (
    <Animated.View style={iconStyle}>
      <ListItemChevron />
    </Animated.View>
  );
};

const Accordion = ({ content, title, className, initiallyOpen = false, unitedBackground = false }: Props) => {
  const listRef = useAnimatedRef();
  const heightValue = useSharedValue(0);
  const open = useSharedValue(initiallyOpen);
  const progress = useDerivedValue(() => (open.value ? withTiming(1) : withTiming(0)));

  const heightAnimationStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  const measureAndToggle = () => {
    runOnUI(() => {
      'worklet';
      const measurements = measure(listRef);
      if (measurements === null) return;

      if (heightValue.value === 0) {
        heightValue.value = withTiming(measurements.height + 5);
        open.value = true;
      } else {
        heightValue.value = withTiming(0);
        open.value = false;
      }
    })();
  };

  useLayoutEffect(() => {
    if (initiallyOpen) {
      // Give more time for initial render
      setTimeout(() => {
        runOnUI(() => {
          'worklet';
          const measurements = measure(listRef);
          if (measurements === null) return;
          heightValue.value = measurements.height + 5;
        })();
      }, 300);
    }
  }, []);

  return (
    <View
      className={clsx(
        'overflow-hidden',
        className || '',
        unitedBackground && 'bg-secondary-light dark:bg-secondary-dark rounded-xl',
      )}
    >
      <Pressable
        onPress={measureAndToggle}
        className="py-3 px-5 bg-secondary-light dark:bg-secondary-dark flex flex-row items-center justify-between rounded-xl mb-2"
      >
        <Text>{title}</Text>
        <Chevron progress={progress} />
      </Pressable>
      <Animated.View style={heightAnimationStyle}>
        <Animated.View className="absolute w-full top-0" ref={listRef}>
          <Divider inset={true} insetType="middle" />
          {content}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default Accordion;
