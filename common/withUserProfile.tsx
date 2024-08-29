import { queryClient } from "@/app/_layout";
import FullScreenActivityIndicator from "@/components/FullScreenActivityIndicator";
import { t } from "@/i18n";
import { useEffect } from "react";
import { Alert } from "react-native";
import { useFetch, logout } from "./api";
import { withSessionToken } from "./sessionToken";

export const withUserProfile = (Component: React.FC) => {
  return withSessionToken((props: any) => {
    const { data, error, isLoading } = useFetch("userProfile", "/users/me");

    const doErrorAlert = () =>
      Alert.alert(t("common.error"), error?.message, [
        {
          text: t("common.retry"),
          onPress: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          },
        },
        {
          text: t("common.logout"),
          onPress: async () => {
            try {
              await logout(true);
            } catch (error) {
              doErrorAlert();
            }
          },
        },
      ]);

    useEffect(() => {
      if (error) {
        doErrorAlert();
      }
    }, [error]);

    if (isLoading) {
      return <FullScreenActivityIndicator />;
    }

    if (!data) {
      return null;
    }

    return <Component {...props} />;
  });
};
