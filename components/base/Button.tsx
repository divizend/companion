import React from 'react';

import { ButtonProps, Button as NativeButton } from '@rneui/themed';
import { StyleSheet } from 'react-native';

import '@/global.css';

export interface StyledButtonProps extends ButtonProps {}

export const Button: React.FC<StyledButtonProps> = ({ loading, onPress, ...rest }) => {
  return (
    <NativeButton
      disabledStyle={[styles.disabledButton, rest.disabledStyle]}
      disabledTitleStyle={[styles.disabledText, rest.disabledTitleStyle]}
      buttonStyle={[styles.button, rest.buttonStyle]}
      containerStyle={[styles.buttonContainer, rest.containerStyle]}
      titleStyle={[styles.buttonText, rest.titleStyle]}
      loading={loading}
      onPress={loading ? undefined : onPress}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
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
