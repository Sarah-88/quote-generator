export const formatLabel = (suffix: string) => (value: number) => {
  return `${value}${suffix}`;
}

export const urlCheck = (url: string) => {
  if (url.length < 3) return false;
  return !/^https?:\/\/\w+(\.[\w]+){1,3}/.test(url);
}

export const hexToRgb = (hex: string) => {
  const colors = hex.match(/[a-z0-9]{2}/g) || [];
  return colors.map((c) => {
    return Number("0x" + c);
  });
}

