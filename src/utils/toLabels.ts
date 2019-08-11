interface Label {
  [key: string]: string
}

function objectToLabels(object: object, prefix?: string): Label[] {
  return Object.entries(object).flatMap(([key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object') {
      return objectToLabels(value, name);
    }

    return {
      [name]: `${value}`,
    };
  });
}

export default (object: object, prefix?: string) => {
  const labels = objectToLabels(object, prefix).reduce(
    (obj, item) => ({
      ...obj,
      ...item,
    }),
    {},
  );
  return labels;
};
