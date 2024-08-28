import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import de from "./de.json";
import en from "./en.json";

const i18n = new I18n({ en, de });
i18n.locale = Localization.getLocales()[0].languageCode!;

export function t(key: string, options?: any) {
  return i18n.t(key, options);
}
