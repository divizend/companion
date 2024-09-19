import { t } from "@/i18n";

export const countries = Object.entries(t("country"))
  .filter(([id, name]) => id !== "xx" && id.length === 2)
  .map(([id, name]) => ({
    id,
    name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
