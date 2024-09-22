import { Alert } from "react-native";
import { t } from "@/i18n";

export function showInputDialog(
  title: string,
  placeholder?: string
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    Alert.prompt(
      title,
      placeholder || "",
      [
        {
          text: t("common.cancel"),
          onPress: () => resolve(undefined),
          style: "cancel",
        },
        {
          text: t("common.submit"),
          onPress: (value: string | undefined) => resolve(value || ""),
        },
      ],
      "plain-text",
      "",
      "default"
    );
  });
}

export function showConfirmationDialog(
  title: string,
  message?: string
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: t("common.cancel"),
        onPress: () => resolve(false),
        style: "cancel",
      },
      {
        text: t("common.yes"),
        onPress: () => resolve(true),
      },
    ]);
  });
}
