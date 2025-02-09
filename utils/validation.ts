import { validateYupSchema, yupToFormErrors } from 'formik';
import * as Yup from 'yup';

interface ValidationResult {
  requiredFields: string[];
  badFields: string[];
  badFieldsWithMessages: Record<string, string>;
}

export function validateValues(schema: Yup.ObjectSchema<any>, values: Record<string, any>): ValidationResult {
  const requiredFields = Object.entries(schema.fields)
    .filter(([_, field]) => (field as any)?.spec?.optional === false)
    .map(f => f[0]);

  try {
    validateYupSchema(values, schema, true);
    return { requiredFields, badFields: [], badFieldsWithMessages: {} };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const badFieldsWithMessages = yupToFormErrors(err);
      const badFields = Object.keys(badFieldsWithMessages);
      return { requiredFields, badFields, badFieldsWithMessages };
    } else {
      throw err;
    }
  }
}

export function isInternalId(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{24}$/.test(str);
}

// source: https://de.wikipedia.org/wiki/Umsatzsteuer-Identifikationsnummer#Aufbau_der_Identifikationsnummer
export const euVatIdSchemas = {
  at: {
    regex: /^ATU[0-9]{8}$/,
    readable: ['ATU99999999'],
  },
  be: {
    regex: /^BE[0-9]{10}$/,
    readable: ['BE9999999999'],
  },
  bg: {
    regex: /^BG[0-9]{9,10}$/,
    readable: ['BG999999999', 'BG9999999999'],
  },
  cy: {
    regex: /^CY[0-9]{8}[A-Z]$/,
    readable: ['CY99999999L'],
  },
  cz: {
    regex: /^CZ[0-9]{8,10}$/,
    readable: ['CZ99999999', 'CZ999999999', 'CZ9999999999'],
  },
  de: {
    regex: /^DE[0-9]{9}$/,
    readable: ['DE999999999'],
  },
  dk: {
    regex: /^DK[0-9]{8}$/,
    readable: ['DK99999999'],
  },
  ee: {
    regex: /^EE[0-9]{9}$/,
    readable: ['EE999999999'],
  },
  gr: {
    regex: /^EL[0-9]{9}$/,
    readable: ['EL999999999'],
  },
  es: {
    regex: /^ES([A-Z0-9][0-9]{8}|[0-9]{8}[A-Z0-9])$/,
    readable: ['ESX9999999X'],
  },
  fi: {
    regex: /^FI[0-9]{8}$/,
    readable: ['FI99999999'],
  },
  fr: {
    regex: /^FR[A-Z0-9]{2}[0-9]{9}$/,
    readable: ['FRXX999999999'],
  },
  hr: {
    regex: /^HR[0-9]{11}$/,
    readable: ['HR99999999999'],
  },
  hu: {
    regex: /^HU[0-9]{8}$/,
    readable: ['HU99999999'],
  },
  ie: {
    regex: /^IE([0-9][A-Z0-9][0-9]{5}[A-Z]|[0-9]{7}[A-W][A-I])$/,
    readable: ['IE9S99999L', 'IE9999999LI'],
  },
  it: {
    regex: /^IT[0-9]{11}$/,
    readable: ['IT99999999999'],
  },
  lt: {
    regex: /^LT([0-9]{9}|[0-9]{12})$/,
    readable: ['LT999999999', 'LT999999999999'],
  },
  lu: {
    regex: /^LU[0-9]{8}$/,
    readable: ['LU99999999'],
  },
  lv: {
    regex: /^LV[0-9]{11}$/,
    readable: ['LV99999999999'],
  },
  mt: {
    regex: /^MT[0-9]{8}$/,
    readable: ['MT99999999'],
  },
  nl: {
    regex: /^NL[A-Z0-9]{10}[0-9]{2}$/,
    readable: ['NL999999999999'],
  },
  pl: {
    regex: /^PL[0-9]{10}$/,
    readable: ['PL9999999999'],
  },
  pt: {
    regex: /^PT[0-9]{9}$/,
    readable: ['PT999999999'],
  },
  ro: {
    regex: /^RO[0-9]{2,10}$/,
    readable: ['RO999999999'],
  },
  se: {
    regex: /^SE[0-9]{12}$/,
    readable: ['SE999999999999'],
  },
  si: {
    regex: /^SI[0-9]{8}$/,
    readable: ['SI99999999'],
  },
  sk: {
    regex: /^SK[0-9]{10}$/,
    readable: ['SK9999999999'],
  },
};

// source: https://de.wikipedia.org/wiki/Steuernummer#Aufbau_der_Steuernummer
export const deSteuerNrSchemas = {
  'de-bb': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-be': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-bw': {
    regex: /^[0-9]{10}$/,
    mask: '99999/99999',
  },
  'de-by': {
    regex: /^[0-9]{11}$/,
    mask: '999/999/99999',
  },
  'de-hb': {
    regex: /^[0-9]{10}$/,
    mask: '99 999 99999',
  },
  'de-he': {
    regex: /^0[0-9]{10}$/,
    mask: '099 999 99999',
  },
  'de-hh': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-mv': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-ni': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-nw': {
    regex: /^[0-9]{11}$/,
    mask: '999/9999/9999',
  },
  'de-rp': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-sh': {
    regex: /^[0-9]{10}$/,
    mask: '99/999/99999',
  },
  'de-sl': {
    regex: /^[0-9]{11}$/,
    mask: '999/999/99999',
  },
  'de-sn': {
    regex: /^2[0-9]{10}$/,
    mask: '299/999/99999',
  },
  'de-st': {
    regex: /^1[0-9]{10}$/,
    mask: '199/999/99999',
  },
  'de-th': {
    regex: /^1[0-9]{10}$/,
    mask: '199/999/99999',
  },
};
