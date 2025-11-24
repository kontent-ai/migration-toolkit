import { promises } from "node:fs";
import type { Buffer as BufferProxy } from "buffer";
import chalk from "chalk";
import type { Logger } from "../core/models/log.models.js";

export function fileManager(logger: Logger) {
	const getFilePath = (filename: string): string => {
		return `./${filename}`;
	};

	const loadFileAsync = async (filename: string): Promise<BufferProxy> => {
		const filePath = getFilePath(filename);

		logger.log({
			type: "readFs",
			message: `Reading file '${chalk.yellow(filePath)}'`,
		});

		const file = await promises.readFile(filePath);

		return file;
	};

	const writeFileAsync = async (fileNameWithoutExtension: string, content: string | BufferProxy): Promise<void> => {
		const filePath = getFilePath(fileNameWithoutExtension);

		logger.log({
			type: "writeFs",
			message: `Storing file '${chalk.yellow(filePath)}'`,
		});
		await promises.writeFile(filePath, content);
	};

	return {
		loadFileAsync,
		writeFileAsync,
	};
}
