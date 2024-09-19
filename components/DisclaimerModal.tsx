import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from "react-native";
import { Button } from "@rneui/themed";
import { t } from "@/i18n";
import { colors } from "@/common/colors";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "@/common/api";
import { Picker } from "@react-native-picker/picker";
import { countries } from "@/common/countries";

interface DisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / screenWidth);
    setCurrentPage(page);
  };

  const handleUnderstand = async () => {
    setIsLoading(true);
    try {
      await apiFetch("/users/flag", {
        method: "POST",
        body: JSON.stringify({
          name: "allowedCompanionAI",
          value: true,
          taxResidency: selectedCountry,
        }),
      });
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPageIndicator = () => {
    return (
      <View style={styles.pageIndicator}>
        {[0, 1, 2].map((page) => (
          <View
            key={page}
            style={[
              styles.indicatorDot,
              page === currentPage && styles.indicatorDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPages = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.page}>
          <Text style={styles.modalTitle}>{t("disclaimer.intro.title")}</Text>
          <Text style={styles.modalText}>{t("disclaimer.intro.message")}</Text>
        </View>
        <View style={styles.page}>
          <Text style={styles.modalTitle}>
            {t("disclaimer.aiDisclaimer.title")}
          </Text>
          <Text style={styles.modalText}>
            {t("disclaimer.aiDisclaimer.message")}
          </Text>
        </View>
        <View style={styles.page}>
          <Text style={styles.modalTitle}>
            {t("disclaimer.taxResidency.title")}
          </Text>
          <Text style={styles.modalText}>
            {t("disclaimer.taxResidency.message")}
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(itemValue) => setSelectedCountry(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label={t("common.select")} value="" />
              {countries.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.code}
                />
              ))}
            </Picker>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {}}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#FFFFFF", "#E8E8FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBackground}
        />
        <View style={styles.modalContainer}>
          {renderPages()}
          {renderPageIndicator()}
          <Button
            title={
              currentPage === 0 || currentPage === 1
                ? t("common.next")
                : isLoading
                ? t("common.loading")
                : t("disclaimer.finalConfirm")
            }
            onPress={() => {
              if (currentPage < 2) {
                scrollViewRef.current?.scrollTo({
                  x: screenWidth * (currentPage + 1),
                  animated: true,
                });
              } else {
                handleUnderstand();
              }
            }}
            buttonStyle={styles.modalButton}
            titleStyle={styles.buttonText}
            loading={isLoading}
            disabled={isLoading || (currentPage === 2 && !selectedCountry)}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: screenHeight,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  page: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
    textAlign: "center",
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 28,
    color: "black",
  },
  modalButton: {
    backgroundColor: colors.theme,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    marginHorizontal: 5,
  },
  indicatorDotActive: {
    backgroundColor: colors.theme,
  },
  dropdown: {
    width: "80%",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  pickerContainer: {
    width: "80%",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },
});
