import { describe, it, expect } from 'vitest';
import { serializeBlock, serializeToHcl, serializeAttribute } from '../src/runtime/serializer';

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
    });
});
