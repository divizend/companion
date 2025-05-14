import React from 'react';

import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import ChatModal from '@/components/ChatModal';
import { Text } from '@/components/base';
import { ModalManager } from '@/components/global/modal';

type EventStyle = 'circle' | 'triangle';

type ExtraProps = {
  coords?: SharedValue<{ cx: number; cy: number }[]>;
  color: string;
  index: number;
  width: number;
  height: number;
  onPress?: () => void;
  setSelectedEvent?: (event: { id: number; date: Date; description: string } | undefined) => void;
  selectedEvent?: {
    id: number;
    date: Date;
    description: string;
  };
  eventStyle?: EventStyle;
};

export function EventDot({
  color,
  coords,
  index,
  width,
  height,
  onPress,
  selectedEvent,
  setSelectedEvent,
  eventStyle = 'circle',
}: ExtraProps): React.ReactElement {
  const baseSize = useSharedValue(15);
  const x = useDerivedValue(() => coords?.value?.[index]?.cx ?? 0);
  const y = useDerivedValue(() => coords?.value?.[index]?.cy ?? 0);
  const isSelected = selectedEvent?.id === index;

  const animateDot = (value?: number) => {
    if (value !== undefined) {
      baseSize.value = withSpring(15, {
        mass: 1,
        stiffness: 1000,
        damping: 50,
      });
    }
  };

  useAnimatedReaction(
    () => coords?.value?.[index]?.cy,
    cy => {
      runOnJS(animateDot)(cy);
    },
    [coords, index],
  );

  const animatedEventStyle = useAnimatedStyle(() => {
    // Apply scaling when selected
    const scale = isSelected ? 1.1 : 1;
    const scaledSize = baseSize.value * scale;

    // Common shadow properties for selected state
    const shadowProps = isSelected
      ? {
          shadowColor: color,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.6,
          shadowRadius: 6,
          elevation: 6,
        }
      : {};

    if (eventStyle === 'circle') {
      return {
        position: 'absolute',
        left: x.value - scaledSize / 2,
        top: y.value - scaledSize / 2,
        width: scaledSize,
        height: scaledSize,
        borderRadius: scaledSize / 2,
        backgroundColor: color,
        zIndex: isSelected ? 101 : 100,
        transform: [{ scale }],
        ...shadowProps,
      };
    } else {
      // For triangle, fix the centering and apply scaling
      const triangleSize = scaledSize;
      const triangleHeight = (triangleSize * Math.sqrt(3)) / 2;

      // Move the triangle's center point to align with the data point
      // The triangle's center of mass is 1/3 of the height from the base
      return {
        position: 'absolute',
        left: x.value - triangleSize / 2,
        // Adjust vertical position to center the triangle's center of mass at the data point
        top: y.value - (triangleHeight * 2) / 3 - 3,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: triangleSize / 2,
        borderRightWidth: triangleSize / 2,
        borderBottomWidth: triangleHeight,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        zIndex: isSelected ? 101 : 100,
        transform: [{ scale }],
        ...shadowProps,
      };
    }
  }, [isSelected]);

  const animatedPopupStyle = useAnimatedStyle(() => {
    const offset = 5;
    const left = Math.max(Math.min(x.value - 100, width - offset), offset);

    return {
      position: 'absolute',
      left,
      top: y.value - 65,
      backgroundColor: 'white',
      padding: 8,
      borderRadius: 6,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      maxWidth: 200,
      zIndex: 102,
    };
  }, [width, height]);

  const openModal = () => {
    if (!selectedEvent) return;

    ModalManager.showModal(({ dismiss }) => (
      <ChatModal
        dismiss={dismiss}
        systemPrompt={`Please explain the financial event: "${selectedEvent.description}". Never use Markdown. Give a short and comprehensive answer and explain, how it affect a portfolio from an investor.`}
        initialUserMessage={`Please explain the financial event: "${selectedEvent.description}"`}
      />
    ));
  };

  return (
    <>
      <Pressable style={styles.eventPressable} onPress={() => onPress?.()} accessibilityRole="button">
        <Animated.View style={animatedEventStyle} />
      </Pressable>

      {isSelected && (
        <>
          <Pressable
            onPress={() => setSelectedEvent?.(undefined)}
            style={styles.backdrop}
            accessibilityLabel="Close event details"
          />
          <Animated.View style={animatedPopupStyle}>
            <Pressable onPress={openModal} accessibilityLabel={`Open ${selectedEvent.description}`}>
              <Text style={styles.popupText}>{selectedEvent.description}</Text>
            </Pressable>
          </Animated.View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  eventPressable: {
    position: 'absolute',
    zIndex: 100,
    padding: 5, // Add touch target padding
  },
  backdrop: {
    position: 'absolute',
    zIndex: 100,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popupText: {
    fontWeight: 'bold',
  },
});
