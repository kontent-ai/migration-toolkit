import { describe, expect, it } from "vitest";
import type { MigrationElementValue } from "../lib/core/models/migration.models.js";
import type { ImportContext } from "../lib/import/import.models.js";
import { importTransforms } from "../lib/translation/transforms/import-transforms.js";

describe("Import Transforms - Number Element", () => {
	const elementCodename = "number_element";

	const transform = (value: MigrationElementValue | undefined) =>
		importTransforms.number({
			elementCodename,
			elementData: { value },
			importContext: {} as ImportContext,
			migrationItems: [],
		});

	it.each([
		{ input: 0, expected: 0 },
		{ input: 42, expected: 42 },
		{ input: -1.5, expected: -1.5 },
		{ input: "0", expected: 0 },
		{ input: undefined, expected: null },
		{ input: "", expected: null },
	])("should import $input as $expected", ({ input, expected }) => {
		const result = transform(input);

		expect(result.element.codename).toBe(elementCodename);
		expect(result.value).toBe(expected);
	});
});
