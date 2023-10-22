import { log, red } from './cli-utils';

export function assertNotNull<T>(value: T | null | undefined, message: string): T {
    if (value === null || value === undefined) {
        log(red(message ?? `Value cannot be null or undefined`));
        process.exit(1);
    }
    return value;
}

export function requireNotNull<T>(value: T | null | undefined, message: string): T {
    if (value === null || value === undefined) {
        throw new Error(message ?? 'Value cannot be null or undefined');
    }
    return value;
}

export function invariant(check: boolean, message: string | (() => string)) {}
