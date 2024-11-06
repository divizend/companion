import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import da from './da.json';
import de from './de.json';
import en from './en.json';
import es from './es.json';
import fi from './fi.json';
import fr from './fr.json';
import is from './is.json';
import it from './it.json';
import nl from './nl.json';
import no from './no.json';
import pt from './pt.json';
import sv from './sv.json';

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: { ...en },
    },
    de: {
      translation: { ...de },
    },
    es: {
      translation: { ...es },
    },
    da: {
      translation: { ...da },
    },
    fi: {
      translation: { ...fi },
    },
    fr: {
      translation: { ...fr },
    },
    is: {
      translation: { ...is },
    },
    it: {
      translation: { ...it },
    },
    nl: {
      translation: { ...nl },
    },
    no: {
      translation: { ...no },
    },
    pt: {
      translation: { ...pt },
    },
    sv: {
      translation: { ...sv },
    },
  },
  compatibilityJSON: 'v3',
  fallbackLng: 'en',
  lng: Localization.getLocales()[0].languageCode || 'en',
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      switch (format) {
        case 'error': {
          if (!value) return '';
          const r = /^([A-Za-z0-9_.-]+)(:|$)/;
          const parts = [];
          let match;
          while (!!(match = value.match(r))) {
            parts.push(match[1]);
            value = value.slice(match[1].length + 1);
          }
          if (parts.length === 0) return value;
          if (parts.length > 1 || value.length > 0) console.log(parts, value);
          return i18next.t('error:' + parts[0], { parts: parts.slice(1), rest: value });
        }
        case 'currency': {
          return value
            ? new Intl.NumberFormat(lng, { style: 'currency', currency: value.unit, ...value.options })
                .format(value.amount)
                .replace('NaN', '')
            : '';
        }
        case 'percent': {
          if (!value) return '';
          const intlConfig: any = { style: 'percent' };
          if (typeof value === 'object') {
            Object.assign(intlConfig, value);
            delete intlConfig.value;
            value = value.value;
          }
          return new Intl.NumberFormat(lng, intlConfig).format(value);
        }
        case 'number': {
          if (!value) return '';
          const intlConfig: any = { maximumFractionDigits: 8 };
          if (typeof value === 'object') {
            Object.assign(intlConfig, value);
            delete intlConfig.value;
            value = value.value;
          }
          return new Intl.NumberFormat(lng, intlConfig).format(value);
        }
        case 'country': {
          return i18next.t('country:' + value);
        }
        case 'weekDayAndTime': {
          return new Intl.DateTimeFormat(lng, {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(value));
        }
        case 'weekDayAndHour': {
          return new Intl.DateTimeFormat(lng, {
            weekday: 'short',
            hour: 'numeric',
          }).format(new Date(value));
        }
        case 'day': {
          return new Intl.DateTimeFormat(lng, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date(value));
        }
        case 'dayShort': {
          return new Intl.DateTimeFormat(lng, {
            day: '2-digit',
            month: 'short',
          }).format(new Date(value));
        }
        case 'dayUTC': {
          return new Intl.DateTimeFormat(lng, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(new Date(value));
        }
        case 'dayLongUTC': {
          return new Intl.DateTimeFormat(lng, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(new Date(value));
        }
        case 'dayLongAndTime': {
          return new Intl.DateTimeFormat(lng, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date(value));
        }
        case 'weekDayShort': {
          return new Intl.DateTimeFormat(lng, {
            weekday: 'short',
          }).format(new Date(value));
        }
        case 'monthUTC': {
          return new Intl.DateTimeFormat(lng, { month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
            new Date(value),
          );
        }
        case 'monthShort': {
          return new Intl.DateTimeFormat(lng, { month: 'short', year: 'numeric' }).format(new Date(value));
        }
        case 'monthLong': {
          return new Intl.DateTimeFormat(lng, { month: 'long', year: 'numeric' }).format(new Date(value));
        }
        case 'monthLongUTC': {
          return new Intl.DateTimeFormat(lng, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
            new Date(value),
          );
        }
        case 'monthShortUTC': {
          return new Intl.DateTimeFormat(lng, { month: 'short', timeZone: 'UTC' }).format(new Date(value));
        }
        case 'yearUTC': {
          return new Intl.DateTimeFormat(lng, { year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
        }
        case 'monthShortYear2DigitUTC': {
          return new Intl.DateTimeFormat(lng, { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(
            new Date(value),
          );
        }
        case 'year2DigitUTC': {
          return '’' + new Intl.DateTimeFormat(lng, { year: '2-digit', timeZone: 'UTC' }).format(new Date(value));
        }
        default: {
          return value;
        }
      }
    },
  },
});

export function t(key: string, options?: any) {
  return i18next.t(key, options) as string;
}
