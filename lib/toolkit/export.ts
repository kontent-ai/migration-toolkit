import type { MigrationData } from "../core/models/migration.models.js";
import type { ExportConfig } from "../export/export.models.js";
import { exportManager } from "../export/export-manager.js";

export async function exportAsync(config: ExportConfig): Promise<MigrationData> {
	return await exportManager(config).exportAsync();
}
