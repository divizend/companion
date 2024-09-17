import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Overlay, Text } from "@rneui/themed";
import { t } from "@/i18n";

interface DialogItem {
  text: string;
  onPress: () => void | Promise<void>;
}

interface CustomDialogProps {
  isVisible: boolean;
  title: string;
  items: DialogItem[];
  onCancel: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  isVisible,
  title,
  items,
  onCancel,
}) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleItemPress = async (item: DialogItem, index: number) => {
    setLoadingIndex(index);
    try {
      await item.onPress();
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={loadingIndex === null ? onCancel : undefined}
      overlayStyle={styles.overlay}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => handleItemPress(item, index)}
              disabled={loadingIndex !== null}
            >
              {loadingIndex === index ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.buttonText}>{item.text}</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
        <View style={[styles.buttonContainer, styles.cancelButtonContainer]}>
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={onCancel}
            disabled={loadingIndex !== null}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 14,
    padding: 0,
    width: "70%",
  },
  container: {
    alignItems: "stretch",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#CCCCCC",
  },
  buttonTouchable: {
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 17,
    textAlign: "center",
    color: "#007AFF",
  },
  cancelButtonContainer: {
    borderTopWidth: 6,
    borderTopColor: "#E5E5EA",
  },
  cancelButtonText: {
    fontWeight: "600",
  },
});

export default CustomDialog;
