import type { MigrationData } from '../core/index.js';
import { executeWithTrackingAsync } from '../core/index.js';
import type { ExportConfig } from '../export/index.js';
import { exportManager } from '../export/index.js';
import { libMetadata } from '../metadata.js';

export async function exportAsync(config: ExportConfig): Promise<MigrationData> {
    return await executeWithTrackingAsync({
        event: {
            tool: 'migrationToolkit',
            package: {
                name: libMetadata.name,
                version: libMetadata.version
            },
            action: 'export',
            relatedEnvironmentId: undefined,
            details: {}
        },
        func: async () => {
            return await exportManager(config).exportAsync();
        },
        logger: config.logger
    });
}
