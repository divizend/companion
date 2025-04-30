import React from 'react';

import { Button, ButtonProps } from '@rneui/themed';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface StyledButtonProps extends ButtonProps {
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const StyledButton: React.FC<StyledButtonProps> = ({ containerStyle, titleStyle, loading, onPress, ...rest }) => {
  return (
    <Button
      disabledStyle={styles.disabledButton}
      disabledTitleStyle={styles.disabledText}
      buttonStyle={styles.button}
      containerStyle={[styles.buttonContainer, containerStyle]}
      titleStyle={[styles.buttonText, titleStyle]}
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
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#222222',
    marginVertical: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    width: 340,
  },
  disabledButton: {
    backgroundColor: '#DDDDDD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#D0D0D0',
  },
});

export default StyledButton;
