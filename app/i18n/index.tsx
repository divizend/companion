import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import da from "./da.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fi from "./fi.json";
import fr from "./fr.json";
import is from "./is.json";
import it from "./it.json";
import nl from "./nl.json";
import no from "./no.json";
import pt from "./pt.json";
import sv from "./sv.json";

const i18n = new I18n({ en, de, es, da, fi, fr, is, it, nl, no, pt, sv });
i18n.locale = Localization.getLocales()[0].languageCode!;
i18n.defaultLocale = "en";
i18n.enableFallback = true;

export function t(key: string, options?: any) {
  return i18n.t(key, options);
}
