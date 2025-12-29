/**
 * Options for serializing a single HCL block.
 */
export interface HclBlockOptions {
    /** Block type, e.g., "resource", "variable", "output", "data" */
    type: string;
    /** Block labels, e.g., ["aws_instance", "web"] for `resource "aws_instance" "web"` */
    labels?: string[];
}

/**
 * Options for the HCL serializer behavior.
 */
export interface HclSerializerOptions {
    /** Number of spaces per indentation level (default: 2) */
    indent?: number;
    /** Quote style for strings: "double" for standard quotes, "heredoc" for <<EOF blocks */
    quoteStyle?: 'double' | 'heredoc';
}

/**
 * Valid HCL value types that can be serialized.
 * Maps to HCL primitives, lists, and maps.
 */
export type HclValue =
    | string
    | number
    | boolean
    | null
    | HclValue[]
    | { [key: string]: HclValue };

/**
 * Module options for HclNuxt configuration in nuxt.config.ts
 */
export interface ModuleOptions {
    /** Default indentation (default: 2) */
    defaultIndent?: number;
    /** Default quote style (default: "double") */
    quoteStyle?: 'double' | 'heredoc';
}
