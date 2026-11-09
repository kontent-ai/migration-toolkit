import { describe, expect, it } from "vitest";
import { MigrationToolkitError } from "../lib/core/models/error.models.js";
import { parseNumberElementValue } from "../lib/core/utils/number.utils.js";

describe("parseNumberElementValue", () => {
	it.each([
		{ input: 0, expected: 0 },
		{ input: 42, expected: 42 },
		{ input: -1.5, expected: -1.5 },
		{ input: "0", expected: 0 },
		{ input: "42", expected: 42 },
	])("should convert $input to $expected", ({ input, expected }) => {
		expect(parseNumberElementValue(input)).toBe(expected);
	});

	it.each([undefined, null, ""])("should treat %j as no value", (input) => {
		expect(parseNumberElementValue(input)).toBeUndefined();
	});

	it("should throw for array value", () => {
		expect(() => parseNumberElementValue([{ codename: "x" }])).toThrow(MigrationToolkitError);
	});
});
