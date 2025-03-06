export const clampArray = <T>(arr: T[], maxSize: number, mergeFn: (arr: T[]) => T): T[] => {
  if (arr.length <= maxSize) return arr;
  return [...arr.slice(0, maxSize), mergeFn(arr.slice(maxSize))];
};
