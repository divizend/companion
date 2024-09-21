import React from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Button, ButtonProps } from "@rneui/themed";

export interface StyledButtonProps extends ButtonProps {
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const StyledButton: React.FC<StyledButtonProps> = ({
  containerStyle,
  titleStyle,
  loading,
  onPress,
  ...rest
}) => {
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
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  disabledText: {
    color: "#D0D0D0",
  },
});

export default StyledButton;
