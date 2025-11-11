import { Buffer as BufferProxy } from 'buffer';
import type { Logger, MigrationData } from '../core/index.js';
import { defaultZipFilename, getDefaultLogger } from '../core/index.js';
import { fileManager } from '../file/index.js';
import { zipManager } from '../zip/index.js';

export interface StoreConfig {
    readonly data: MigrationData;
    readonly filename?: string;
    readonly logger?: Logger;
}

export interface ExtractConfig {
    readonly filename?: string;
    readonly logger?: Logger;
}

export async function storeAsync(config: StoreConfig): Promise<void> {
    const logger = config.logger ?? getDefaultLogger();
    const filename = config.filename ?? defaultZipFilename;

    const zipData = await zipManager(logger).createZipAsync(config.data);

    if (zipData instanceof BufferProxy) {
        await fileManager(logger).writeFileAsync(filename, zipData);
    } else {
        throw Error(`Cannot store '${filename}' on File system because the provided zip is not a Buffer`);
    }
}

export async function extractAsync(config: ExtractConfig): Promise<MigrationData> {
    const logger = config.logger ?? getDefaultLogger();
    const filename = config.filename ?? defaultZipFilename;

    const fileData = await fileManager(logger).loadFileAsync(filename);
    return await zipManager(logger).parseZipAsync(fileData);
}
