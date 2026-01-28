import { serializeToHcl, serializeBlock, serializeAttribute } from "../serializer.js";
export function useHcl() {
  return {
    /**
     * Serialize a single HCL value to string.
     */
    serialize: (value, options) => serializeToHcl(value, options),
    /**
     * Serialize a complete HCL block with type, labels, and body.
     */
    block: (type, labels, body, options) => serializeBlock(type, labels, body, options),
    /**
     * Serialize a single attribute line (key = value).
     */
    attribute: (key, value, options) => serializeAttribute(key, value, options)
  };
}
