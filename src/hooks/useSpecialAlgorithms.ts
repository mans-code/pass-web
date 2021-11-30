/** Validate ID numbers using luhn algorithm. */
export function useLuhnCheck(): (value: string) => boolean {
  const arr: number[] = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  return (value: string): boolean => {
    var len = value.length,
      bit = 1,
      sum = 0,
      val;

    while (len) {
      val = parseInt(value.charAt(--len), 10);
      sum += (bit ^= 1) ? arr[val] : val;
    }

    return !!(sum && sum % 10 === 0);
  };
}
