const leadingZero = (value: string, length: number) =>
  value.length < length ? `0${value}` : value;

export const localISOFormat = (value: string) => {
  const dt = new Date(value);
  const year = dt.getFullYear();
  const month = leadingZero((dt.getMonth() + 1).toString(), 2);
  const day = leadingZero(dt.getDate().toString(), 2);
  const hour = leadingZero(dt.getHours().toString(), 2);
  const minute = leadingZero(dt.getMinutes().toString(), 2);
  const second = leadingZero(dt.getSeconds().toString(), 2);
  const tz = -dt.getTimezoneOffset();
  const tzs = tz > 0 ? "+" : "-";

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${tzs}${leadingZero(
    (tz / 60).toString(),
    2
  )}:${leadingZero((tz % 60).toString(), 2)}`;
};

export const localDate = (value: string) => {
  const dt = new Date(value);
  const year = dt.getFullYear();
  const month = leadingZero((dt.getMonth() + 1).toString(), 2);
  const day = leadingZero(dt.getDate().toString(), 2);

  return `${year}-${month}-${day}`;
};

export const localDateTmp = (value: string) => {
  const dt = new Date(value);
  const year = dt.getFullYear();
  const month = leadingZero((dt.getMonth() + 1).toString(), 2);
  const day = leadingZero(dt.getDate().toString(), 2);

  return `${day}-${month}-${year}`;
};
