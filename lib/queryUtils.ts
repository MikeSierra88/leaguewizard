export const queryToString = (input: string | string[]): string => {
  return Array.isArray(input) ? input.join(' ') : input;
};
