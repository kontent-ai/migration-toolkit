import { isBrowser, isNode, isWebWorker } from 'browser-or-node';
import { format } from 'bytes';
import type { EnvContext } from '../models/core.models.js';

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const isNotUndefined = <T>(item: T | undefined): item is T => item !== undefined;

export const isString = (value: unknown): value is string => typeof value === 'string';
export const isArray = <T>(value: unknown): value is Array<T> => Array.isArray(value);

export function formatBytes(bytes: number): string {
    return format(bytes) ?? 'n/a';
}

export function exitProgram(data: { readonly message: string }): never {
    throw Error(data.message);
}

export function getCurrentEnvironment(): EnvContext {
    if (isNode) {
        return 'node';
    }
    if (isBrowser || isWebWorker) {
        return 'browser';
    }

    throw Error(`Invalid current environment. This library can be used in node.js or in browsers.`);
}

export const defaultZipFilename: string = 'data.zip';


