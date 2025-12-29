import type { HclValue, HclSerializerOptions } from '../types';
import { serializeToHcl, serializeBlock, serializeAttribute } from '../serializer';

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
export function useHcl() {
    return {
        /**
         * Serialize a single HCL value to string.
         */
        serialize: (value: HclValue, options?: HclSerializerOptions) =>
            serializeToHcl(value, options),

        /**
         * Serialize a complete HCL block with type, labels, and body.
         */
        block: (
            type: string,
            labels: string[],
            body: Record<string, HclValue>,
            options?: HclSerializerOptions
        ) => serializeBlock(type, labels, body, options),

        /**
         * Serialize a single attribute line (key = value).
         */
        attribute: (key: string, value: HclValue, options?: HclSerializerOptions) =>
            serializeAttribute(key, value, options),
    };
}
