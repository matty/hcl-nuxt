import { isHclExpression } from "./types.js";
const DEFAULT_INDENT = 2;
function escapeString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}
function formatValue(value, indent, level) {
  if (value === null) {
    return "null";
  }
  if (isHclExpression(value)) {
    return value.hcl;
  }
  switch (typeof value) {
    case "string":
      return `"${escapeString(value)}"`;
    case "number":
      return String(value);
    case "boolean":
      return value ? "true" : "false";
    case "object":
      if (Array.isArray(value)) {
        return formatList(value, indent, level);
      }
      return formatMap(value, indent, level);
    default:
      return `"${String(value)}"`;
  }
}
function formatList(items, indent, level) {
  if (items.length === 0) {
    return "[]";
  }
  const padding = " ".repeat(indent * (level + 1));
  const closePadding = " ".repeat(indent * level);
  const formattedItems = items.map((item) => `${padding}${formatValue(item, indent, level + 1)}`).join(",\n");
  return `[
${formattedItems},
${closePadding}]`;
}
function formatMap(obj, indent, level) {
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return "{}";
  }
  const padding = " ".repeat(indent * (level + 1));
  const closePadding = " ".repeat(indent * level);
  const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
  const formattedEntries = entries.map(([key, val]) => {
    const paddedKey = key.padEnd(maxKeyLength);
    return `${padding}${paddedKey} = ${formatValue(val, indent, level + 1)}`;
  }).join("\n");
  return `{
${formattedEntries}
${closePadding}}`;
}
export function serializeAttribute(key, value, options) {
  const indent = options?.indent ?? DEFAULT_INDENT;
  return `${key} = ${formatValue(value, indent, 0)}`;
}
export function serializeBlock(type, labels, body, options) {
  const indent = options?.indent ?? DEFAULT_INDENT;
  const padding = " ".repeat(indent);
  const quotedLabels = labels.map((l) => `"${escapeString(l)}"`).join(" ");
  const header = labels.length > 0 ? `${type} ${quotedLabels} {` : `${type} {`;
  const entries = Object.entries(body);
  if (entries.length === 0) {
    return `${header}
}`;
  }
  const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
  const formattedBody = entries.map(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value) && !isHclExpression(value)) {
      const nestedContent = formatNestedBlock(key, value, indent, 1);
      return nestedContent;
    }
    const paddedKey = key.padEnd(maxKeyLength);
    return `${padding}${paddedKey} = ${formatValue(value, indent, 1)}`;
  }).join("\n");
  return `${header}
${formattedBody}
}`;
}
function formatNestedBlock(blockType, body, indent, level) {
  const padding = " ".repeat(indent * level);
  const innerPadding = " ".repeat(indent * (level + 1));
  const entries = Object.entries(body);
  if (entries.length === 0) {
    return `${padding}${blockType} {}`;
  }
  const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
  const formattedEntries = entries.map(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return formatNestedBlock(key, value, indent, level + 1);
    }
    const paddedKey = key.padEnd(maxKeyLength);
    return `${innerPadding}${paddedKey} = ${formatValue(value, indent, level + 1)}`;
  }).join("\n");
  return `${padding}${blockType} {
${formattedEntries}
${padding}}`;
}
export function serializeToHcl(value, options) {
  const indent = options?.indent ?? DEFAULT_INDENT;
  return formatValue(value, indent, 0);
}
