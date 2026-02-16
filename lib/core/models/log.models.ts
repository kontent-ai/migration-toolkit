import type { MapiAction, MapiType, MigrationItemType } from "./core.models.js";

export type DebugType =
	| "error"
	| "completed"
	| "warning"
	| "info"
	| "errorData"
	| "cancel"
	| "process"
	| "readFs"
	| "skip"
	| "writeFs"
	| "download"
	| MigrationItemType
	| MapiType
	| MapiAction;

export type LogMessage = {
	readonly type?: DebugType;
	readonly message: string;
};

export type LogSpinnerMessage = LogMessage & {
	readonly prefix?: string;
};

export type LogData = (data: LogMessage) => void;
export type LogSpinnerData = (data: LogSpinnerMessage) => void;

export type Logger = {
	readonly logWithSpinnerAsync: <T>(func: (logData: LogSpinnerData) => Promise<T>) => Promise<T>;
	readonly log: LogData;
};
