type ParamType = "string" | "number" | "boolean" | "object" | "array";

interface ValidateParamOptions {
  allowEmpty?: boolean;
}

export function validateParam(
  param: any,
  type: ParamType,
  options: ValidateParamOptions = {}
): boolean {
  if (param === null || param === undefined) return false;

  switch (type) {
    case "string":
      if (typeof param !== "string") return false;
      if (!options.allowEmpty && param.trim() === "") return false;
      break;
    case "number":
      if (typeof param !== "number" || isNaN(param)) return false;
      break;
    case "boolean":
      if (typeof param !== "boolean") return false;
      break;
    case "object":
      if (typeof param !== "object" || Array.isArray(param)) return false;
      if (!options.allowEmpty && Object.keys(param).length === 0) return false;
      break;
    case "array":
      if (!Array.isArray(param)) return false;
      if (!options.allowEmpty && param.length === 0) return false;
      break;
    default:
      return false;
  }
  return true;
}
