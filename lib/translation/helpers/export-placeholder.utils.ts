export function getMissingReferencePlaceholder({ type, id }: { readonly type: 'item' | 'asset'; readonly id: string }): string {
    return `#missing:${type}:${id}#`;
}