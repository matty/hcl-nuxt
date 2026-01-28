import type { HclValue, HclSerializerOptions } from './types.js';
/**
 * Serializes a single attribute line: `key = value`
 */
export declare function serializeAttribute(key: string, value: HclValue, options?: HclSerializerOptions): string;
/**
 * Serializes an HCL block with type, labels, and body.
 *
 * @example
 * ```typescript
 * serializeBlock('resource', ['aws_instance', 'web'], {
 *   ami: 'ami-12345678',
 *   instance_type: 't2.micro',
 * })
 * // Output:
 * // resource "aws_instance" "web" {
 * //   ami           = "ami-12345678"
 * //   instance_type = "t2.micro"
 * // }
 * ```
 */
export declare function serializeBlock(type: string, labels: string[], body: Record<string, HclValue>, options?: HclSerializerOptions): string;
/**
 * Serializes a generic HCL value (for standalone use).
 */
export declare function serializeToHcl(value: HclValue, options?: HclSerializerOptions): string;
