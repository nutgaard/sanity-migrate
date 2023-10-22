import { trimIndent } from './string-utils';

export const red = (msg: string) => `\x1b[31m${msg}\x1b[0m`;
export const green = (msg: string) => `\x1b[32m${msg}\x1b[0m`;
export const cyan = (msg: string) => `\x1b[36m${msg}\x1b[0m`;
export const bold = (msg: string) => `\x1b[1m${msg}\x1b[0m`;
export const italic = (msg: string) => `\x1b[3m${msg}\x1b[0m`;
export const log = (...msg: string[]) => process.stderr.write(trimIndent(msg.map((it) => `${it}`).join(' ') + '\n'));
