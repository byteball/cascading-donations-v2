export const getCountOfDecimals = (x: string) => {
  return ~(x + "").indexOf(".") ? (x + "").split(".")[1].length : 0;
};