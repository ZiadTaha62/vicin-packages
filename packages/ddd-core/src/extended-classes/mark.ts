import { register } from '../registry';

export const MarkFactory = <C extends Function>(ctor: C) => {
  return <L extends string>(label: L) => {
    return function (target: any, context: any) {
      const anyCtor = ctor as any;
      if (!anyCtor.isInstance(target.prototype)) {
        throw new Error(
          `[DDD-core Error] '${anyCtor.kind}' decorator can only be used on ${splitCamelCase(anyCtor.kind)}s`
        );
      }

      register(target, label, anyCtor.kind, anyCtor.objectKind);
    };
  };
};

export const markFactory = <C extends Function>(ctor: C) => {
  return <T extends Function, L extends string>(target: T, label: L) => {
    const anyCtor = ctor as any;
    if (!anyCtor.isInstance(target.prototype)) {
      throw new Error(
        `[DDD-core Error] '${lowerCaseFirstLitter(anyCtor.kind)}' function can only be used on ${splitCamelCase(anyCtor.kind)}s`
      );
    }

    register(target, label, anyCtor.kind, anyCtor.objectKind);
  };
};

function splitCamelCase(str: string) {
  return (
    str
      // insert space before capital letters
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // handle cases like "XMLHttp"
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .toLowerCase()
  );
}

function lowerCaseFirstLitter(str: string) {
  if (str.length < 2) {
    throw new Error("'lowerCaseFirstLitter' accepts 2 letter strings or more only");
  }
  return str[0]!.toLowerCase() + str.slice(1);
}
