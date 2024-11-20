import React from 'react';

import { ListItemChevron } from '@rneui/base/dist/ListItem/ListItem.Chevron';
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

const Accordion = ({ content, title, className }: Props) => {
  const listRef = useAnimatedRef();
  const heightValue = useSharedValue(0);
  const open = useSharedValue(false);
  const progress = useDerivedValue(() => (open.value ? withTiming(1) : withTiming(0)));

  const heightAnimationStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  return (
    <View className={clsx('overflow-hidden', className || '')}>
      <Pressable
        onPress={() => {
          if (heightValue.value === 0) {
            runOnUI(() => {
              'worklet';
              heightValue.value = withTiming(measure(listRef)!.height + 5);
            })();
          } else {
            heightValue.value = withTiming(0);
          }
          open.value = !open.value;
        }}
        className="py-3 px-5 bg-secondary-light dark:bg-secondary-dark flex flex-row items-center justify-between rounded-xl mb-2"
      >
        <Text>{title}</Text>
        <Chevron progress={progress} />
      </Pressable>
      <Animated.View style={heightAnimationStyle}>
        <Animated.View className="absolute w-full top-0" ref={listRef}>
          {content}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default Accordion;
