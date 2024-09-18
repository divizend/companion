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
          text: t("learn.inputDialog.cancel"),
          onPress: () => reject(),
          style: "cancel",
        },
        {
          text: t("learn.inputDialog.confirm"),
          onPress: (value: string | undefined) => resolve(value || ""),
        },
      ],
      "plain-text",
      "",
      "default"
    );
  });
}
