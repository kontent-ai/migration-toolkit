import { MigrationToolkitError } from "../models/error.models.js";
import { isArray } from "./global.utils.js";

/**
 * Converts a number element value to a number. Only `null`, `undefined` and empty string are treated
 * as "no value", so `0` is preserved.
 */
export function parseNumberElementValue(value: unknown): number | undefined {
	if (value === null || value === undefined || value === "") {
		return undefined;
	}

	if (isArray(value)) {
		throw new MigrationToolkitError("invalidValue", "Expected value to be a number, not array");
	}

	return +value;
}
