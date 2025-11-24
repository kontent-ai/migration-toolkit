import type { Buffer as BufferProxy } from "buffer";
import JSZip from "jszip";
import { getDefaultLogger } from "../core/logs/loggers.js";
import type { Logger } from "../core/models/log.models.js";
import type { MigrationData } from "../core/models/migration.models.js";
import type { FileBinaryData } from "./zip.models.js";
import { zipPackager } from "./zip-packager.js";
import { zipTransformer } from "./zip-transformer.js";

export function zipManager(logger?: Logger) {
	const loggerToUse = logger ?? getDefaultLogger();

	const createZipAsync = async (migrationData: MigrationData): Promise<FileBinaryData> => {
		loggerToUse.log({
			type: "info",
			message: `Creating zip package`,
		});

		return await zipTransformer(zipPackager(new JSZip()), loggerToUse).transformAsync(migrationData);
	};

	const parseZipAsync = async (zipFile: BufferProxy): Promise<MigrationData> => {
		loggerToUse.log({
			type: "info",
			message: `Parsing zip file`,
		});

		const zipPackage = zipPackager(await JSZip.loadAsync(zipFile, {}));
		return await zipTransformer(zipPackage, loggerToUse).parseAsync();
	};

	return {
		createZipAsync,
		parseZipAsync,
	};
}
