export const capitalize = (str: string) =>
  `${str.substring(0, 1)}${str.substring(1).toLowerCase()}`;

export const containsString = (str: string, arr: string[]) => arr.includes(str);

export const concatStrings = (...strs: string[]): string =>
  strs
    .filter(Boolean)
    .map((str) => str.trim())
    .join(" ");
