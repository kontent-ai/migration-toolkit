/**
 * Returns a placeholder that indicates missing reference, this placeholder is not actually used anywhere
 * as missing items will simply be skipped, but may help when debugging in future
 * @param type - The type of the reference
 * @param id - The id of the reference
 * @returns A placeholder that indicates missing reference
 */
export function getMissingReferencePlaceholder({ type, id }: { readonly type: "item" | "asset"; readonly id: string }): string {
	return `#missing:${type}:${id}#`;
}
