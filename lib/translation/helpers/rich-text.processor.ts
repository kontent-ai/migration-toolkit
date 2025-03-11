import type { AssetStateInTargetEnvironmentByCodename, ItemStateInTargetEnvironmentByCodename } from '../../core/index.js';

export type CodenameReplaceFunc<T> = (codename: string) => T;
export type IdReplaceFunc = (id: string) => { codename: string };

interface ProcessCodenamesResult {
    readonly codenames: ReadonlySet<string>;
    readonly html: string;
}

interface ProcessIdsResult {
    readonly ids: ReadonlySet<string>;
    readonly html: string;
}

const attributes = {
    codenames: {
        itemCodenameAttribute: 'data-codename',
        linkItemCodenameAttribute: 'data-item-codename',
        assetCodenameAttribute: 'data-asset-codename'
    },
    ids: {
        assetIdAttributeName: 'data-asset-id',
        itemIdAttributeName: 'data-item-id',
        itemExternalIdAttributeName: 'data-item-external-id',
        idAttributeName: 'data-id',
        externalIdAttributeName: 'data-external-id',
        externalAssetIdAttributeName: 'data-asset-external-id'
    },
    componentIdentifierAttribute: 'data-type="component"'
} as const;

const rteRegexes = {
    elements: {
        objectTagRegex: new RegExp(`<object(.+?)</object>`, 'gs'),
        imgTagRegex: new RegExp(`<img(.+?)</img>`, 'gs'),
        figureTagRegex: new RegExp(`<figure(.+?)</figure>`, 'gs'),
        linkTagRegex: new RegExp(`<a(.+?)</a>`, 'gs')
    },
    ids: {
        dataItemIdAttrRegex: new RegExp(`${attributes.ids.itemIdAttributeName}=\\"(.+?)\\"`),
        dataAssetIdAttrRegex: new RegExp(`${attributes.ids.assetIdAttributeName}=\\"(.+?)\\"`),
        dataIdAttrRegex: new RegExp(`${attributes.ids.idAttributeName}=\\"(.+?)\\"`)
    },
    codenames: {
        rteItemCodenameRegex: new RegExp(`${attributes.codenames.itemCodenameAttribute}=\\"(.+?)\\"`),
        rteLinkItemCodenameRegex: new RegExp(`${attributes.codenames.linkItemCodenameAttribute}=\\"(.+?)\\"`),
        rteAssetCodenameRegex: new RegExp(`${attributes.codenames.assetCodenameAttribute}=\\"(.+?)\\"`)
    }
} as const;

export function richTextProcessor() {
    const processDataIds = (richTextHtml: string, replaceFunc?: IdReplaceFunc): ProcessIdsResult => {
        const itemIds = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.objectTagRegex, (objectTag) => {
            // skip processing for components
            if (objectTag.includes(attributes.componentIdentifierAttribute)) {
                return objectTag;
            }
            const itemIdMatch = objectTag.match(rteRegexes.ids.dataIdAttrRegex);
            if (itemIdMatch && (itemIdMatch?.length ?? 0) >= 2) {
                const itemId = itemIdMatch[1];

                itemIds.add(itemId);

                if (replaceFunc) {
                    const { codename } = replaceFunc(itemId);

                    return objectTag.replaceAll(
                        `${attributes.ids.idAttributeName}="${itemId}"`,
                        `${attributes.codenames.itemCodenameAttribute}="${codename}"`
                    );
                }
            }

            return objectTag;
        });

        return {
            html: processedRte,
            ids: itemIds
        };
    };

    const processAssetIds = (richTextHtml: string, replaceFunc?: IdReplaceFunc): ProcessIdsResult => {
        const assetIds = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.figureTagRegex, (figureTag) => {
            const assetIdMatch = figureTag.match(rteRegexes.ids.dataAssetIdAttrRegex);
            if (assetIdMatch && (assetIdMatch?.length ?? 0) >= 2) {
                const assetId = assetIdMatch[1];

                assetIds.add(assetId);

                if (replaceFunc) {
                    const { codename } = replaceFunc(assetId);

                    return figureTag.replaceAll(
                        `${attributes.ids.assetIdAttributeName}="${assetId}"`,
                        `${attributes.codenames.assetCodenameAttribute}="${codename}"`
                    );
                }
            }

            return figureTag;
        });

        return {
            html: processedRte,
            ids: assetIds
        };
    };

    const processLinkAssetIds = (richTextHtml: string, replaceFunc?: IdReplaceFunc): ProcessIdsResult => {
        const assetIds = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.linkTagRegex, (linkTag) => {
            const assetIdMatch = linkTag.match(rteRegexes.ids.dataAssetIdAttrRegex);
            if (assetIdMatch && (assetIdMatch?.length ?? 0) >= 2) {
                const assetId = assetIdMatch[1];

                assetIds.add(assetId);

                if (replaceFunc) {
                    const { codename } = replaceFunc(assetId);

                    return linkTag.replaceAll(
                        `${attributes.ids.assetIdAttributeName}="${assetId}"`,
                        `${attributes.codenames.assetCodenameAttribute}="${codename}"`
                    );
                }
            }

            return linkTag;
        });

        return {
            html: processedRte,
            ids: assetIds
        };
    };

    const processLinkItemIds = (richTextHtml: string, replaceFunc?: IdReplaceFunc): ProcessIdsResult => {
        const linkItemIds = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.linkTagRegex, (linkTag) => {
            const itemIdMatch = linkTag.match(rteRegexes.ids.dataItemIdAttrRegex);
            if (itemIdMatch && (itemIdMatch?.length ?? 0) >= 2) {
                const itemId = itemIdMatch[1];
                linkItemIds.add(itemId);

                if (replaceFunc) {
                    const { codename } = replaceFunc(itemId);

                    return linkTag.replaceAll(
                        `${attributes.ids.itemIdAttributeName}="${itemId}"`,
                        `${attributes.codenames.linkItemCodenameAttribute}="${codename}"`
                    );
                }
            }

            return linkTag;
        });

        return {
            html: processedRte,
            ids: linkItemIds
        };
    };

    const processItemCodenames = (
        richTextHtml: string,
        replaceFunc?: CodenameReplaceFunc<ItemStateInTargetEnvironmentByCodename>
    ): ProcessCodenamesResult => {
        const itemCodenames = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.objectTagRegex, (objectTag) => {
            const codenameMatch = objectTag.match(rteRegexes.codenames.rteItemCodenameRegex);
            if (codenameMatch && (codenameMatch?.length ?? 0) >= 2) {
                const codename = codenameMatch[1];

                itemCodenames.add(codename);

                if (replaceFunc) {
                    const itemState = replaceFunc(codename);

                    if (itemState.item && itemState.state === 'exists') {
                        // no need to replace codename attribute
                        return objectTag;
                    }

                    return objectTag.replaceAll(
                        `${attributes.codenames.itemCodenameAttribute}="${codename}"`,
                        `${attributes.ids.externalIdAttributeName}="${itemState.externalIdToUse}"`
                    );
                }
            }

            return objectTag;
        });

        return {
            codenames: itemCodenames,
            html: processedRte
        };
    };

    const processLinkItemCodenames = (
        richTextHtml: string,
        replaceFunc?: CodenameReplaceFunc<ItemStateInTargetEnvironmentByCodename>
    ): ProcessCodenamesResult => {
        const itemCodenames = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.linkTagRegex, (linkTag) => {
            const codenameMatch = linkTag.match(rteRegexes.codenames.rteLinkItemCodenameRegex);
            if (codenameMatch && (codenameMatch?.length ?? 0) >= 2) {
                const codename = codenameMatch[1];

                itemCodenames.add(codename);

                if (replaceFunc) {
                    const itemState = replaceFunc(codename);

                    if (itemState.item && itemState.state === 'exists') {
                        return linkTag;
                    }
                    return linkTag.replaceAll(
                        `${attributes.codenames.linkItemCodenameAttribute}="${codename}"`,
                        `${attributes.ids.itemExternalIdAttributeName}="${itemState.externalIdToUse}"`
                    );
                }
            }

            return linkTag;
        });

        return {
            codenames: itemCodenames,
            html: processedRte
        };
    };

    const processAssetCodenames = (
        richTextHtml: string,
        replaceFunc?: CodenameReplaceFunc<AssetStateInTargetEnvironmentByCodename>
    ): ProcessCodenamesResult => {
        const assetCodenames = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.figureTagRegex, (figureTag) => {
            const codenameMatch = figureTag.match(rteRegexes.codenames.rteAssetCodenameRegex);
            if (codenameMatch && (codenameMatch?.length ?? 0) >= 2) {
                const codename = codenameMatch[1];

                assetCodenames.add(codename);

                if (replaceFunc) {
                    const assetState = replaceFunc(codename);

                    if (assetState.asset && assetState.state === 'exists') {
                        return figureTag;
                    }
                    return figureTag.replaceAll(
                        `${attributes.codenames.assetCodenameAttribute}="${codename}"`,
                        `${attributes.ids.externalAssetIdAttributeName}="${assetState.externalIdToUse}"`
                    );
                }
            }

            return figureTag;
        });

        return {
            codenames: assetCodenames,
            html: processedRte
        };
    };

    const processLinkAssetCodenames = (
        richTextHtml: string,
        replaceFunc?: CodenameReplaceFunc<AssetStateInTargetEnvironmentByCodename>
    ): ProcessCodenamesResult => {
        const assetCodenames = new Set<string>();

        const processedRte = richTextHtml.replaceAll(rteRegexes.elements.linkTagRegex, (linkTag) => {
            const codenameMatch = linkTag.match(rteRegexes.codenames.rteAssetCodenameRegex);
            if (codenameMatch && (codenameMatch?.length ?? 0) >= 2) {
                const codename = codenameMatch[1];

                assetCodenames.add(codename);

                if (replaceFunc) {
                    const assetState = replaceFunc(codename);

                    if (assetState.asset && assetState.state === 'exists') {
                        return linkTag;
                    }
                    return linkTag.replaceAll(
                        `${attributes.codenames.assetCodenameAttribute}="${codename}"`,
                        `${attributes.ids.externalAssetIdAttributeName}="${assetState.externalIdToUse}"`
                    );
                }
            }

            return linkTag;
        });

        return {
            codenames: assetCodenames,
            html: processedRte
        };
    };

    return {
        processAssetIds,
        processDataIds,
        processLinkItemIds,
        processLinkAssetIds,
        processAssetCodenames,
        processItemCodenames,
        processLinkItemCodenames,
        processLinkAssetCodenames
    };
}
