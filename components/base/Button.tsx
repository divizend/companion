import React from 'react';

import { ButtonProps, Button as NativeButton } from '@rneui/themed';
import { StyleSheet } from 'react-native';

import '@/global.css';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface StyledButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<StyledButtonProps> = ({
  loading,
  onPress,
  variant = 'primary',
  disabledStyle,
  containerStyle,
  disabledTitleStyle,
  ...rest
}) => {
  const { theme } = useThemeColor();

  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'primary'
      ? {
          backgroundColor: theme,
          borderColor: theme,
          borderWidth: 1,
          borderRadius: 12,
        }
      : {
          borderColor: theme,
        },
    rest.buttonStyle,
  ];

  const titleStyle = [
    styles.buttonText,
    variant === 'secondary' && {
      color: theme,
    },
    rest.titleStyle,
  ];

  return (
    <NativeButton
      disabledStyle={[styles.disabledButton, disabledStyle]}
      disabledTitleStyle={[styles.disabledText, disabledTitleStyle]}
      buttonStyle={buttonStyle}
      containerStyle={[styles.buttonContainer, containerStyle]}
      titleStyle={titleStyle}
      loading={loading}
      onPress={loading ? undefined : onPress}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#00008f',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#00008f',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#D0D0D0',
  },
});
