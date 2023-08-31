export const ErrorMessageGetter = (data) => {
  const result = [];

  data.details.forEach((detail) => {
    const { key, label } = detail.context;
    result.push({ [key]: label });
  });

  return result;
};
