import type { MapiAction, MapiType, MigrationItemType } from '../index.js';

export type DebugType =
    | 'error'
    | 'completed'
    | 'warning'
    | 'info'
    | 'errorData'
    | 'cancel'
    | 'process'
    | 'readFs'
    | 'skip'
    | 'writeFs'
    | 'download'
    | MigrationItemType
    | MapiType
    | MapiAction;

export interface LogMessage {
    readonly type?: DebugType;
    readonly message: string;
}

export interface LogSpinnerMessage extends LogMessage {
    readonly prefix?: string;
}

export type LogData = (data: LogMessage) => void;
export type LogSpinnerData = (data: LogSpinnerMessage) => void;

export interface Logger {
    readonly logWithSpinnerAsync: <T>(func: (logData: LogSpinnerData) => Promise<T>) => Promise<T>;
    readonly log: LogData;
}
