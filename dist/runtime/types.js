export function isHclExpression(value) {
  return typeof value === "object" && value !== null && "kind" in value && value.kind === "expression" && "hcl" in value && typeof value.hcl === "string";
}
