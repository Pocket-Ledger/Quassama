export const capitalizeFirst = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getFirstLetterCapitalized = (str) => {
  if (!str) return '';
  return str?.charAt(0)?.toUpperCase();
};
