function deepObjectValue(object: any, key: string) {
  const keyList = key.split('.');
  if (keyList.length === 1) return object[keyList[0]];

  const value = keyList.reduce((accumulator, currentValue) => {
    return accumulator[currentValue];
  }, object);

  return value;
}

export function interpolateObject(obj: object, vars: object) {
  // TODO: переделать, очень костыльно
  const traverse = (value: any) => {
    if (typeof value === 'string') {
      const formatedVal = value.replace(/\$\{(.*?)\}/g, (_, name) => {
        const key = name.trim() as string;
        let result: any;

        if (key.includes('.')) {
          const [mainVariable, ...otherVars] = key.split('.');
          result = deepObjectValue(vars[mainVariable], otherVars.join('.'));
        } else {
          result = vars[key];
        }

        if (typeof result === 'undefined') {
          throw new ReferenceError(`Variable ${key} is not defined`);
        }

        return result;
      });
      if (formatedVal === 'true') return true;
      if (formatedVal === 'false') return false;
      if (formatedVal === 'null') return null;
      if (!isNaN(formatedVal as any)) return Number(formatedVal);

      return formatedVal;
    } else if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, traverse(val)]),
      );
    }

    return value;
  };

  return traverse(obj);
}
