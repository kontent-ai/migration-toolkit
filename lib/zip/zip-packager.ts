import { Buffer as BufferProxy } from 'buffer';
import chalk from 'chalk';
import type JSZip from 'jszip';
import { match } from 'ts-pattern';
import type { Logger } from '../core/index.js';
import { exitProgram, formatBytes, getCurrentEnvironment, getDefaultLogger } from '../core/index.js';
import type { FileBinaryData, ZipCompressionLevel, ZipPackager } from './zip.models.js';

type ZipOutputType = 'nodebuffer' | 'blob';

export function zipPackager(jsZip: JSZip): ZipPackager {
    const getZipOutputType = (): 'nodebuffer' | 'blob' => {
        return match(getCurrentEnvironment())
            .returnType<ZipOutputType>()
            .with('browser', () => 'blob')
            .with('node', () => 'nodebuffer')
            .exhaustive();
    };

    const getZipSizeInBytes = (zipData: FileBinaryData): number => {
        return match(zipData)
            .when(
                (data) => data instanceof Blob,
                (data) => data.size
            )
            .when(
                (data) => data instanceof BufferProxy,
                (data) => data.byteLength
            )
            .otherwise(() => {
                exitProgram({
                    message: `Unrecognized zip data type '${typeof zipData}'`
                });
            });
    };

    return {
        addFile(filePath: string, data: string | FileBinaryData): JSZip {
            return jsZip.file(filePath, data);
        },
        addFolder(name: string): ZipPackager {
            const folder = jsZip.folder(name);

            if (!folder) {
                throw Error(`Failed to add folder '${name}'`);
            }

            return zipPackager(folder);
        },
        async generateZipAsync(config: { logger?: Logger; compressionLevel?: ZipCompressionLevel }): Promise<FileBinaryData> {
            const logger = config.logger ?? getDefaultLogger();
            const zipOutputType = getZipOutputType();
            const compressionLevel: ZipCompressionLevel = config.compressionLevel ?? 9;

            logger.log({
                type: 'info',
                message: `Creating zip file using '${chalk.yellow(zipOutputType)}' with compression level '${chalk.yellow(
                    compressionLevel.toString()
                )}'`
            });

            const result = await jsZip.generateAsync({
                type: zipOutputType,
                compression: 'DEFLATE',
                compressionOptions: {
                    level: compressionLevel
                },
                streamFiles: true
            });

            logger.log({
                type: 'info',
                message: `Zip successfully generated (${chalk.yellow(formatBytes(getZipSizeInBytes(result)))})`
            });

            return result;
        },
        async getBinaryDataAsync(filePath: string): Promise<FileBinaryData | undefined> {
            return await jsZip.file(filePath)?.async(getZipOutputType());
        },
        async getFileContentAsync(filePath: string): Promise<string | undefined> {
            return await jsZip.file(filePath)?.async('string');
        }
    };
}
