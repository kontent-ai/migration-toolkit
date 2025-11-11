import type { MigrationData } from '../core/index.js';
import type { ExportConfig } from '../export/index.js';
import { exportManager } from '../export/index.js';

export async function exportAsync(config: ExportConfig): Promise<MigrationData> {
    return await exportManager(config).exportAsync();
}
