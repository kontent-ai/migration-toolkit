import type { IRetryStrategyOptions } from '@kontent-ai/core-sdk';
import type {
    AssetFolderModels,
    CollectionModels,
    ContentTypeModels,
    ContentTypeSnippetModels,
    EnvironmentModels,
    LanguageModels,
    ManagementClient,
    TaxonomyModels,
    WorkflowModels
} from '@kontent-ai/management-sdk';
import { createManagementClient } from '@kontent-ai/management-sdk';
import chalk from 'chalk';
import { coreConfig } from '../config.js';
import type { FlattenedContentType, FlattenedContentTypeElement } from '../models/core.models.js';
import type { LogSpinnerData, Logger } from '../models/log.models.js';
import { findRequired } from './array.utils.js';
import { isNotUndefined } from './global.utils.js';
import { defaultHttpService, defaultRetryStrategy } from './http.utils.js';
import { runMapiRequestAsync } from './run.utils.js';

export interface ManagementClientConfig {
    readonly environmentId: string;
    readonly apiKey: string;
    readonly retryStrategy?: Readonly<IRetryStrategyOptions>;
    readonly baseUrl?: string;
}

export function getMigrationManagementClient(config: ManagementClientConfig): Readonly<ManagementClient> {
    return createManagementClient({
        environmentId: config.environmentId,
        retryStrategy: config.retryStrategy ?? defaultRetryStrategy,
        httpService: defaultHttpService,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        headers: [
            {
                header: coreConfig.kontentTrackingHeaderName,
                value: coreConfig.kontentTrackingHeaderValue
            }
        ]
    });
}

export function managementClientUtils(client: Readonly<ManagementClient>, logger: Logger) {
    const getEnvironmentAsync = async (): Promise<EnvironmentModels.EnvironmentInformationModel> => {
        return (await client.environmentInformation().toPromise()).data.project;
    };

    const getAllLanguagesAsync = async (logSpinner: LogSpinnerData): Promise<readonly LanguageModels.LanguageModel[]> => {
        return await runMapiRequestAsync({
            logSpinner: logSpinner,
            logger: logger,
            func: async () => (await client.listLanguages().toAllPromise()).data.items,
            action: 'list',
            type: 'language'
        });
    };

    const getAllCollectionsAsync = async (logSpinner: LogSpinnerData): Promise<readonly CollectionModels.Collection[]> => {
        return await runMapiRequestAsync({
            logger: logger,
            logSpinner: logSpinner,
            func: async () => (await client.listCollections().toPromise()).data.collections,
            action: 'list',
            type: 'collection'
        });
    };

    const getAllWorkflowsAsync = async (logSpinner: LogSpinnerData): Promise<readonly WorkflowModels.Workflow[]> => {
        return await runMapiRequestAsync({
            logger: logger,
            logSpinner: logSpinner,
            func: async () => (await client.listWorkflows().toPromise()).data,
            action: 'list',
            type: 'workflow'
        });
    };

    const getAllTaxonomiesAsync = async (logSpinner: LogSpinnerData): Promise<readonly TaxonomyModels.Taxonomy[]> => {
        return await runMapiRequestAsync({
            logger: logger,
            logSpinner: logSpinner,
            func: async () => (await client.listTaxonomies().toAllPromise()).data.items,
            action: 'list',
            type: 'taxonomy'
        });
    };

    const getAllAssetFoldersAsync = async (logSpinner: LogSpinnerData): Promise<readonly AssetFolderModels.AssetFolder[]> => {
        return await runMapiRequestAsync({
            logger: logger,
            logSpinner: logSpinner,
            func: async () => (await client.listAssetFolders().toPromise()).data.items,
            action: 'list',
            type: 'assetFolder'
        });
    };

    const getContentTypeElements = (
        contentType: ContentTypeModels.ContentType,
        contentTypeSnippets: readonly ContentTypeSnippetModels.ContentTypeSnippet[]
    ): readonly FlattenedContentTypeElement[] => {
        return contentType.elements
            .flatMap((element) => {
                if (!element.codename || !element.id) {
                    return undefined;
                }

                if (element.type === 'guidelines') {
                    return undefined;
                }

                if (element.type === 'snippet') {
                    const snippetElement = element;

                    // replace snippet element with actual elements
                    const contentTypeSnippet = findRequired(
                        contentTypeSnippets,
                        (snippet) => snippet.id === snippetElement.snippet.id,
                        `Could not find content type snippet for element. This snippet is referenced in type '${chalk.red(
                            contentType.codename
                        )}'`
                    );

                    return contentTypeSnippet.elements.map((snippetElement) => {
                        if (snippetElement.type === 'guidelines' || snippetElement.type === 'snippet') {
                            return undefined;
                        }
                        if (!snippetElement.codename || !snippetElement.id) {
                            return undefined;
                        }

                        const flattenedElement: FlattenedContentTypeElement = {
                            codename: snippetElement.codename,
                            type: snippetElement.type,
                            id: snippetElement.id,
                            element: snippetElement
                        };

                        return flattenedElement;
                    });
                }
                const flattenedElement: FlattenedContentTypeElement = {
                    codename: element.codename,
                    id: element.id,
                    type: element.type,
                    element: element
                };

                return flattenedElement;
            })
            .filter(isNotUndefined);
    };

    const getFlattenedContentTypesAsync = async (logSpinner: LogSpinnerData): Promise<readonly FlattenedContentType[]> => {
        const contentTypes = await runMapiRequestAsync({
            logger: logger,
            logSpinner: logSpinner,
            func: async () => (await client.listContentTypes().toAllPromise()).data.items,
            action: 'list',
            type: 'contentType'
        });

        const contentTypeSnippets = await runMapiRequestAsync({
            logger: logger,
            logSpinner: logSpinner,
            func: async () => (await client.listContentTypeSnippets().toAllPromise()).data.items,
            action: 'list',
            type: 'contentTypeSnippet'
        });

        return [
            ...contentTypes.map((contentType) => {
                const importType: FlattenedContentType = {
                    contentTypeCodename: contentType.codename,
                    contentTypeId: contentType.id,
                    elements: getContentTypeElements(contentType, contentTypeSnippets)
                };

                return importType;
            })
        ];
    };

    return {
        getAllCollectionsAsync,
        getAllLanguagesAsync,
        getAllWorkflowsAsync,
        getAllTaxonomiesAsync,
        getFlattenedContentTypesAsync,
        getEnvironmentAsync,
        getAllAssetFoldersAsync
    };
}
