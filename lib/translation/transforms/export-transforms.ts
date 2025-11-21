import type { ContentTypeElements, TaxonomyModels } from '@kontent-ai/management-sdk';
import chalk from 'chalk';
import type { MigrationElementTransformData, MigrationElementType, MigrationReference } from '../../core/index.js';
import { findRequired, isArray, isNotUndefined, isString } from '../../core/index.js';
import type { ExportContext, ExportElement, ExportTransformFunc } from '../../export/index.js';
import { richTextProcessor } from '../helpers/rich-text.processor.js';

export const exportTransforms: Readonly<Record<MigrationElementType, ExportTransformFunc>> = {
    text: (data) => {
        return {
            value: data.exportElement.value && isString(data.exportElement.value) ? data.exportElement.value : undefined
        };
    },
    number: (data) => {
        if (data.exportElement.value === undefined || data.exportElement.value === null) {
            return {
                value: undefined
            };
        }

        if (isArray(data.exportElement.value)) {
            throw Error(`Expected value to be a number, not array`);
        }

        if (data.exportElement.value === 0) {
            return {
                value: 0
            };
        }

        return {
            value: +data.exportElement.value
        };
    },
    date_time: (data) => {
        return {
            value: data.exportElement.value && isString(data.exportElement.value) ? data.exportElement.value : undefined,
            display_timezone: data.exportElement.displayTimezone ?? undefined
        };
    },
    rich_text: (data) => transformRichTextValue(data.exportElement, data.context),
    asset: (data) => {
        if (!data.exportElement.value) {
            return {
                value: []
            };
        }

        if (!isArray(data.exportElement.value)) {
            throw Error(`Expected value to be an array`);
        }

        return {
            // translate asset id to codename
            value: data.exportElement.value
                .map((m) => m.id)
                .filter(isNotUndefined)
                .map<MigrationReference | undefined>((id) => {
                    const assetState = data.context.getAssetStateInSourceEnvironment(id);

                    if (assetState.asset) {
                        // reference asset by codename
                        return { codename: assetState.asset.codename };
                    } else {
                        if (data.context.exportContextOptions.skipMissingReferences) {
                            return undefined;
                        }
                        throw Error(`Missing asset with id '${chalk.red(id)}'`);
                    }
                })
                .filter(isNotUndefined)
        };
    },
    taxonomy: (data) => {
        if (!data.exportElement.value) {
            return {
                value: []
            };
        }

        if (!isArray(data.exportElement.value)) {
            throw Error(`Expected value to be an array`);
        }

        const taxonomyElement = data.typeElement.element as Readonly<ContentTypeElements.ITaxonomyElement>;
        const taxonomyGroupId = taxonomyElement.taxonomy_group.id ?? 'n/a';

        // get taxonomy group
        const taxonomy = findRequired(
            data.context.environmentData.taxonomies,
            (taxonomy) => taxonomy.id === taxonomyGroupId,
            `Could not find taxonomy group with id '${chalk.red(taxonomyGroupId)}'`
        );

        return {
            // translate taxonomy term to codename
            value: data.exportElement.value
                .map((m) => m.id)
                .filter(isNotUndefined)
                .map<MigrationReference>((id) => {
                    const taxonomyTerm = findTaxonomy(id, taxonomy);

                    if (taxonomyTerm) {
                        // reference taxonomy term by codename
                        return { codename: taxonomyTerm.codename };
                    } else {
                        throw Error(`Missing taxonomy term with id '${chalk.red(id)}'`);
                    }
                })
        };
    },
    modular_content: (data) => {
        if (!data.exportElement.value) {
            return {
                value: []
            };
        }

        if (!isArray(data.exportElement.value)) {
            throw Error(`Expected value to be an array`);
        }

        return {
            // translate item id to codename
            value: data.exportElement.value
                .map((m) => m.id)
                .filter(isNotUndefined)
                .map<MigrationReference | undefined>((id) => {
                    const itemState = data.context.getItemStateInSourceEnvironment(id);

                    if (itemState.item) {
                        // reference item by codename
                        return { codename: itemState.item.codename };
                    } else {
                        if (data.context.exportContextOptions.skipMissingReferences) {
                            return undefined;
                        }
                        throw Error(`Missing item with id '${chalk.red(id)}'`);
                    }
                })
                .filter(isNotUndefined)
        };
    },
    custom: (data) => {
        return {
            value: data.exportElement.value && isString(data.exportElement.value) ? data.exportElement.value : undefined
        };
    },
    url_slug: (data) => {
        return {
            value: data.exportElement.value && isString(data.exportElement.value) ? data.exportElement.value : undefined,
            mode: data.exportElement.urlSlugMode ?? 'autogenerated'
        };
    },
    multiple_choice: (data) => {
        if (!data.exportElement.value) {
            return {
                value: []
            };
        }

        if (!isArray(data.exportElement.value)) {
            throw Error(`Expected value to be an array`);
        }

        // translate multiple choice option id to codename
        const multipleChoiceElement = data.typeElement.element as Readonly<ContentTypeElements.IMultipleChoiceElement>;

        return {
            value: data.exportElement.value
                .map((m) => m.id)
                .filter(isNotUndefined)
                .map<MigrationReference>((id) => {
                    const option = findRequired(
                        multipleChoiceElement.options,
                        (option) => option.id === id,
                        `Could not find multiple choice element with option id '${chalk.red(id)}'`
                    );

                    if (!option.codename) {
                        throw Error(`Invalid codename for multiple choice option '${chalk.red(option.name)}'`);
                    }

                    return { codename: option.codename };
                })
        };
    },
    subpages: (data) => {
        if (!data.exportElement.value) {
            return {
                value: []
            };
        }
        if (!isArray(data.exportElement.value)) {
            throw Error(`Expected value to be an array`);
        }

        return {
            // translate item id to codename
            value: data.exportElement.value
                .map((m) => m.id)
                .filter(isNotUndefined)
                .map<MigrationReference | undefined>((id) => {
                    const itemState = data.context.getItemStateInSourceEnvironment(id);

                    if (itemState.item) {
                        // reference item by codename
                        return { codename: itemState.item.codename };
                    } else {
                        if (data.context.exportContextOptions.skipMissingReferences) {
                            return undefined;
                        }
                        throw Error(`Missing item with id '${chalk.red(id)}'`);
                    }
                })
                .filter(isNotUndefined)
        };
    }
};

function findTaxonomy(termId: string, taxonomy: Readonly<TaxonomyModels.Taxonomy>): Readonly<TaxonomyModels.Taxonomy> | undefined {
    if (taxonomy.id === termId) {
        return taxonomy;
    }

    if (taxonomy.terms) {
        const foundTerm = taxonomy.terms.find((term) => findTaxonomy(termId, term));

        if (foundTerm) {
            return foundTerm;
        }
    }

    return undefined;
}

function transformRichTextValue(exportElement: ExportElement, context: ExportContext): MigrationElementTransformData {
    if (!exportElement.value) {
        return {
            components: [],
            value: ''
        };
    }

    let richTextHtml: string = exportElement.value && isString(exportElement.value) ? exportElement.value : '';

    // replace item ids with codenames
    richTextHtml = richTextProcessor().processDataIds(richTextHtml, (id) => {
        const itemInEnv = context.getItemStateInSourceEnvironment(id).item;

        if (!itemInEnv) {
            if (context.exportContextOptions.skipMissingReferences) {
                // Return a placeholder that will be help explain the missing item
                return { codename: `__missing_item_${id}__` };
            }
            throw Error(`Failed to get item with id '${chalk.red(id)}'`);
        }

        return {
            codename: itemInEnv.codename
        };
    }).html;

    // replace link item ids with codenames
    richTextHtml = richTextProcessor().processLinkItemIds(richTextHtml, (id) => {
        const itemInEnv = context.getItemStateInSourceEnvironment(id).item;

        if (!itemInEnv) {
            if (context.exportContextOptions.skipMissingReferences) {
                // Return a placeholder that will be help explain the missing item
                return { codename: `__missing_item_${id}__` };
            }
            throw Error(`Failed to get item with id '${chalk.red(id)}'`);
        }

        return {
            codename: itemInEnv.codename
        };
    }).html;

    // replace asset ids with codenames
    richTextHtml = richTextProcessor().processAssetIds(richTextHtml, (id) => {
        const assetInEnv = context.getAssetStateInSourceEnvironment(id).asset;

        if (!assetInEnv) {
            if (context.exportContextOptions.skipMissingReferences) {
                // Return a placeholder that will be help explain the missing item
                return { codename: `__missing_asset_${id}__` };
            }
            throw Error(`Failed to get asset with id '${chalk.red(id)}'`);
        }

        return {
            codename: assetInEnv.codename
        };
    }).html;

    // replace link asset ids with codenames
    richTextHtml = richTextProcessor().processLinkAssetIds(richTextHtml, (id) => {
        const assetInEnv = context.getAssetStateInSourceEnvironment(id).asset;

        if (!assetInEnv) {
            if (context.exportContextOptions.skipMissingReferences) {
                // Return a placeholder that will be help explain the missing item
                return { codename: `__missing_asset_${id}__` };
            }
            throw Error(`Failed to get asset with id '${chalk.red(id)}'`);
        }

        return {
            codename: assetInEnv.codename
        };
    }).html;

    return {
        components: exportElement.components,
        value: richTextHtml
    };
}
