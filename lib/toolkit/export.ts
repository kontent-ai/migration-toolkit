import type { MigrationData } from "../core/models/migration.models.js";
import { executeWithTrackingAsync } from "../core/utils/global.utils.js";
import type { ExportConfig } from "../export/export.models.js";
import { exportManager } from "../export/export-manager.js";
import { libMetadata } from "../metadata.js";

export async function exportAsync(config: ExportConfig): Promise<MigrationData> {
	return await executeWithTrackingAsync({
		event: {
			tool: "migrationToolkit",
			package: {
				name: libMetadata.name,
				version: libMetadata.version,
			},
			action: "export",
			relatedEnvironmentId: undefined,
			details: {},
		},
		func: async () => {
			return await exportManager(config).exportAsync();
		},
		logger: config.logger,
	});
}
