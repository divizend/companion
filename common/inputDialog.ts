import { Alert } from "react-native";
import { t } from "@/i18n";

export function showInputDialog(
  title: string,
  placeholder?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    Alert.prompt(
      title,
      placeholder || "",
      [
        {
          text: t("common.cancel"),
          onPress: () => reject(),
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
