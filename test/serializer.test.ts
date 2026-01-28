import { describe, it, expect } from 'vitest';
import { serializeBlock, serializeToHcl, serializeAttribute } from '../src/runtime/serializer';
import { isHclExpression, type HclExpression } from '../src/runtime/types';

describe('HCL Serializer', () => {
    describe('serializeToHcl', () => {
        it('serializes strings with quotes', () => {
            expect(serializeToHcl('hello')).toBe('"hello"');
        });

        it('serializes numbers', () => {
            expect(serializeToHcl(42)).toBe('42');
            expect(serializeToHcl(3.14)).toBe('3.14');
        });

        it('serializes booleans', () => {
            expect(serializeToHcl(true)).toBe('true');
            expect(serializeToHcl(false)).toBe('false');
        });

        it('serializes null', () => {
            expect(serializeToHcl(null)).toBe('null');
        });

        it('escapes special characters in strings', () => {
            expect(serializeToHcl('hello\nworld')).toBe('"hello\\nworld"');
            expect(serializeToHcl('say "hi"')).toBe('"say \\"hi\\""');
            expect(serializeToHcl('path\\to\\file')).toBe('"path\\\\to\\\\file"');
        });

        it('serializes empty arrays', () => {
            expect(serializeToHcl([])).toBe('[]');
        });

        it('serializes arrays with items', () => {
            const result = serializeToHcl(['a', 'b', 'c']);
            expect(result).toContain('"a"');
            expect(result).toContain('"b"');
            expect(result).toContain('"c"');
        });

        it('serializes empty objects', () => {
            expect(serializeToHcl({})).toBe('{}');
        });

        it('serializes objects with properties', () => {
            const result = serializeToHcl({ name: 'test', count: 5 });
            expect(result).toContain('name');
            expect(result).toContain('"test"');
            expect(result).toContain('count');
            expect(result).toContain('5');
        });

        it('serializes HCL expressions without quotes', () => {
            const expr: HclExpression = { kind: 'expression', hcl: 'var.environment' };
            expect(serializeToHcl(expr)).toBe('var.environment');
        });

        it('serializes complex HCL expressions', () => {
            const expr: HclExpression = { kind: 'expression', hcl: 'azurerm_resource_group.main.location' };
            expect(serializeToHcl(expr)).toBe('azurerm_resource_group.main.location');
        });

        it('serializes function call expressions', () => {
            const expr: HclExpression = { kind: 'expression', hcl: 'lower(var.name)' };
            expect(serializeToHcl(expr)).toBe('lower(var.name)');
        });
    });

    describe('serializeAttribute', () => {
        it('serializes a simple attribute', () => {
            expect(serializeAttribute('ami', 'ami-12345')).toBe('ami = "ami-12345"');
        });

        it('serializes numeric attributes', () => {
            expect(serializeAttribute('count', 3)).toBe('count = 3');
        });

        it('serializes boolean attributes', () => {
            expect(serializeAttribute('enabled', true)).toBe('enabled = true');
        });

        it('serializes expression attributes without quotes', () => {
            const expr: HclExpression = { kind: 'expression', hcl: 'var.region' };
            expect(serializeAttribute('location', expr)).toBe('location = var.region');
        });
    });

    describe('serializeBlock', () => {
        it('serializes a resource block with labels', () => {
            const result = serializeBlock('resource', ['aws_instance', 'web'], {
                ami: 'ami-12345678',
                instance_type: 't2.micro',
            });

            expect(result).toContain('resource "aws_instance" "web" {');
            expect(result).toContain('ami');
            expect(result).toContain('"ami-12345678"');
            expect(result).toContain('instance_type');
            expect(result).toContain('"t2.micro"');
            expect(result).toContain('}');
        });

        it('serializes a variable block with single label', () => {
            const result = serializeBlock('variable', ['instance_count'], {
                type: 'number',
                default: 1,
            });

            expect(result).toContain('variable "instance_count" {');
            expect(result).toContain('type');
            expect(result).toContain('default');
        });

        it('serializes an output block', () => {
            const result = serializeBlock('output', ['instance_ip'], {
                value: '${aws_instance.web.public_ip}',
            });

            expect(result).toContain('output "instance_ip" {');
            expect(result).toContain('value');
        });

        it('serializes a block without labels', () => {
            const result = serializeBlock('terraform', [], {
                required_version: '>= 1.0',
            });

            expect(result).toContain('terraform {');
            expect(result).toContain('required_version');
        });

        it('serializes nested blocks', () => {
            const result = serializeBlock('resource', ['aws_instance', 'web'], {
                ami: 'ami-12345678',
                tags: {
                    Name: 'HelloWorld',
                    Environment: 'dev',
                },
            });

            expect(result).toContain('resource "aws_instance" "web" {');
            expect(result).toContain('tags {');
            expect(result).toContain('Name');
            expect(result).toContain('"HelloWorld"');
        });

        it('aligns attribute keys', () => {
            const result = serializeBlock('resource', ['aws_instance', 'web'], {
                ami: 'ami-12345678',
                instance_type: 't2.micro',
            });

            // Check that shorter keys are padded
            const lines = result.split('\n');
            const amiLine = lines.find(l => l.includes('ami') && !l.includes('instance'));
            const typeLine = lines.find(l => l.includes('instance_type'));

            expect(amiLine).toBeDefined();
            expect(typeLine).toBeDefined();

            // Both '=' should be at the same position (indicating alignment)
            const amiEqPos = amiLine!.indexOf('=');
            const typeEqPos = typeLine!.indexOf('=');
            expect(amiEqPos).toBe(typeEqPos);
        });

        it('serializes blocks with expression values', () => {
            const result = serializeBlock('resource', ['azurerm_resource_group', 'main'], {
                name: 'my-rg',
                location: { kind: 'expression', hcl: 'var.location' } as HclExpression,
            });

            expect(result).toContain('resource "azurerm_resource_group" "main" {');
            expect(result).toMatch(/name\s+=\s+"my-rg"/);
            expect(result).toMatch(/location\s+=\s+var\.location/);
            // Expression should NOT be quoted
            expect(result).not.toContain('"var.location"');
        });

        it('serializes mixed literal and expression values', () => {
            const result = serializeBlock('resource', ['azurerm_virtual_network', 'vnet'], {
                name: { kind: 'expression', hcl: 'local.vnet_name' } as HclExpression,
                resource_group_name: { kind: 'expression', hcl: 'azurerm_resource_group.main.name' } as HclExpression,
                location: 'eastus',
                address_space: ['10.0.0.0/16'],
            });

            // Check expressions are unquoted
            expect(result).toMatch(/name\s+=\s+local\.vnet_name/);
            expect(result).toMatch(/resource_group_name\s+=\s+azurerm_resource_group\.main\.name/);
            // Check literal is quoted
            expect(result).toMatch(/location\s+=\s+"eastus"/);
        });
    });
});

describe('isHclExpression', () => {
    it('returns true for valid expression objects', () => {
        expect(isHclExpression({ kind: 'expression', hcl: 'var.test' })).toBe(true);
    });

    it('returns false for strings', () => {
        expect(isHclExpression('var.test')).toBe(false);
    });

    it('returns false for numbers', () => {
        expect(isHclExpression(42)).toBe(false);
    });

    it('returns false for null', () => {
        expect(isHclExpression(null)).toBe(false);
    });

    it('returns false for objects without kind property', () => {
        expect(isHclExpression({ hcl: 'var.test' })).toBe(false);
    });

    it('returns false for objects with wrong kind', () => {
        expect(isHclExpression({ kind: 'literal', hcl: 'var.test' })).toBe(false);
    });

    it('returns false for objects without hcl property', () => {
        expect(isHclExpression({ kind: 'expression' })).toBe(false);
    });

    it('returns false for objects with non-string hcl', () => {
        expect(isHclExpression({ kind: 'expression', hcl: 123 })).toBe(false);
    });
});

