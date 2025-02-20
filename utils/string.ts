/**
 * Capitalizes the first letter of a given string.
 *
 * @param str - The string to be capitalized.
 * @returns The capitalized string.
 *
 * @example
 * ```
 * const result = capitalize('hello');
 * console.log(result); // 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
