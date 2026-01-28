import type { HclValue, HclSerializerOptions } from '../types.js';
/**
 * Composable for HCL serialization in Vue components.
 *
 * @example
 * ```vue
 * <script setup>
 * const { serialize, block } = useHcl();
 *
 * const hcl = block('resource', ['aws_instance', 'web'], {
 *   ami: 'ami-12345678',
 *   instance_type: 't2.micro',
 * });
 * </script>
 * ```
 */
export declare function useHcl(): {
    /**
     * Serialize a single HCL value to string.
     */
    serialize: (value: HclValue, options?: HclSerializerOptions) => string;
    /**
     * Serialize a complete HCL block with type, labels, and body.
     */
    block: (type: string, labels: string[], body: Record<string, HclValue>, options?: HclSerializerOptions) => string;
    /**
     * Serialize a single attribute line (key = value).
     */
    attribute: (key: string, value: HclValue, options?: HclSerializerOptions) => string;
};
