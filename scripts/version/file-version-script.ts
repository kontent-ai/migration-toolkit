import fs from "node:fs";
import chalk from "chalk";
// biome-ignore lint/correctness/useImportExtensions: We need to use the package.json file
import PackageJson from "../../package.json" with { type: "json" };

export const createVersionFile = (date: Date, filePath: string, propertyName: string) => {
	console.log(chalk.cyan(`\nCreating version file at '${filePath}' with prop '${propertyName}'`));
	const timestamp = date.toUTCString();

	const src = `
export const ${propertyName} = {
	name: '${PackageJson.name}',
    timestamp: '${timestamp}',
    version: '${PackageJson.version}'
};
`;

	fs.writeFile(filePath, src, { flag: "w" }, (err) => {
		if (err) {
			console.log(chalk.red(err.message));
			return;
		}

		console.log(chalk.green(`Updating version ${chalk.yellow(PackageJson.version)}`));
		console.log(`${chalk.green("Writing version to ")}${chalk.yellow(filePath)}\n`);
	});
};
