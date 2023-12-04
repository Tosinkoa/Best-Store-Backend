export const errorMessageGetter = (data) => {
  const result = [];

  data.details.forEach((detail) => {
    result.push({ [detail.context.key]: detail.message });
  });

  return result;
};
