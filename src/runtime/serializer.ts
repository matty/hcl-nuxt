import type { HclValue, HclSerializerOptions } from './types';

const DEFAULT_INDENT = 2;

/**
 * Escapes a string for HCL string literals.
 * Handles quotes, backslashes, and common escape sequences.
 */
function escapeString(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

/**
 * Formats a single HCL value to its string representation.
 */
function formatValue(value: HclValue, indent: number, level: number): string {
    if (value === null) {
        return 'null';
    }

    switch (typeof value) {
        case 'string':
            return `"${escapeString(value)}"`;

        case 'number':
            return String(value);

        case 'boolean':
            return value ? 'true' : 'false';

        case 'object':
            if (Array.isArray(value)) {
                return formatList(value, indent, level);
            }
            return formatMap(value as Record<string, HclValue>, indent, level);

        default:
            return `"${String(value)}"`;
    }
}

/**
 * Formats an array as an HCL list.
 */
function formatList(items: HclValue[], indent: number, level: number): string {
    if (items.length === 0) {
        return '[]';
    }

    const padding = ' '.repeat(indent * (level + 1));
    const closePadding = ' '.repeat(indent * level);

    const formattedItems = items
        .map(item => `${padding}${formatValue(item, indent, level + 1)}`)
        .join(',\n');

    return `[\n${formattedItems},\n${closePadding}]`;
}

/**
 * Formats an object as an HCL map/block body.
 */
function formatMap(
    obj: Record<string, HclValue>,
    indent: number,
    level: number
): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
        return '{}';
    }

    const padding = ' '.repeat(indent * (level + 1));
    const closePadding = ' '.repeat(indent * level);

    // Calculate max key length for alignment
    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));

    const formattedEntries = entries
        .map(([key, val]) => {
            const paddedKey = key.padEnd(maxKeyLength);
            return `${padding}${paddedKey} = ${formatValue(val, indent, level + 1)}`;
        })
        .join('\n');

    return `{\n${formattedEntries}\n${closePadding}}`;
}

/**
 * Serializes a single attribute line: `key = value`
 */
export function serializeAttribute(
    key: string,
    value: HclValue,
    options?: HclSerializerOptions
): string {
    const indent = options?.indent ?? DEFAULT_INDENT;
    return `${key} = ${formatValue(value, indent, 0)}`;
}

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
export function serializeBlock(
    type: string,
    labels: string[],
    body: Record<string, HclValue>,
    options?: HclSerializerOptions
): string {
    const indent = options?.indent ?? DEFAULT_INDENT;
    const padding = ' '.repeat(indent);

    // Build block header: type "label1" "label2" {
    const quotedLabels = labels.map(l => `"${escapeString(l)}"`).join(' ');
    const header = labels.length > 0
        ? `${type} ${quotedLabels} {`
        : `${type} {`;

    const entries = Object.entries(body);
    if (entries.length === 0) {
        return `${header}\n}`;
    }

    // Calculate max key length for alignment
    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));

    // Format body entries
    const formattedBody = entries
        .map(([key, value]) => {
            // Check if value is a nested block (object without nested objects/arrays)
            if (
                typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)
            ) {
                // Nested block formatting
                const nestedContent = formatNestedBlock(key, value as Record<string, HclValue>, indent, 1);
                return nestedContent;
            }

            const paddedKey = key.padEnd(maxKeyLength);
            return `${padding}${paddedKey} = ${formatValue(value, indent, 1)}`;
        })
        .join('\n');

    return `${header}\n${formattedBody}\n}`;
}

/**
 * Formats a nested block (for objects within the body).
 */
function formatNestedBlock(
    blockType: string,
    body: Record<string, HclValue>,
    indent: number,
    level: number
): string {
    const padding = ' '.repeat(indent * level);
    const innerPadding = ' '.repeat(indent * (level + 1));

    const entries = Object.entries(body);
    if (entries.length === 0) {
        return `${padding}${blockType} {}`;
    }

    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));

    const formattedEntries = entries
        .map(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return formatNestedBlock(key, value as Record<string, HclValue>, indent, level + 1);
            }
            const paddedKey = key.padEnd(maxKeyLength);
            return `${innerPadding}${paddedKey} = ${formatValue(value, indent, level + 1)}`;
        })
        .join('\n');

    return `${padding}${blockType} {\n${formattedEntries}\n${padding}}`;
}

/**
 * Serializes a generic HCL value (for standalone use).
 */
export function serializeToHcl(
    value: HclValue,
    options?: HclSerializerOptions
): string {
    const indent = options?.indent ?? DEFAULT_INDENT;
    return formatValue(value, indent, 0);
}
