export const isValidJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

/**
 * This function converts an rgb string to hex string
 * @param rgbString - rgb string
 * @returns hex string
 */
export const rgbToHex = (rgbString: string) => {
  const rgb = rgbString.replace(/[^\d,]/g, '').split(',');
  const r = parseInt(rgb[0], 10);
  const g = parseInt(rgb[1], 10);
  const b = parseInt(rgb[2], 10);

  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
};

/**
 * This function converts an RGB string to a HSL string
 * @param rgbString - rgb string
 * @returns hsl Object
 */
export const rgbToHsl = (rgbString: string) => {
  const rgb = rgbString.replace(/[^\d,]/g, '').split(',');
  const r = parseInt(rgb[0], 10) / 255;
  const g = parseInt(rgb[1], 10) / 255;
  const b = parseInt(rgb[2], 10) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = (max + min) / 2;
  let s = (max + min) / 2;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }

    h /= 6;
  }

  return {
    h,
    s,
    l,
    toString: function () {
      return `hsl(${this.h * 360}, ${this.s * 100}%, ${this.l * 100}%)`;
    },
  };
};

/**
 * This functions checks whether a given string is a valid ISIN or not
 *
 * @param str - string to check
 */
export const isValidISIN = (str: string) => {
  const result = new RegExp(/^[A-Z]{2}[A-Z0-9]{9}\d$/).test(str);
  return result;
};
