import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export async function findFiles(directory: string): Promise<string[]> {
    const directoryExists = await fs.stat(directory);
    if (!directoryExists.isDirectory()) return [];

    const entries = await fs.readdir(directory);
    const files = [];
    for (const entry of entries) {
        let file = path.join(directory, entry);
        const stats = await fs.stat(file);
        if (stats.isFile()) {
            files.push(file);
        }
    }
    return files;
}

export async function importAll<T>(files: string[]): Promise<T[]> {
    return Promise.all(files.map((file) => import(file)));
}

export async function checksumFile(file: string): Promise<string> {
    const content = await fs.readFile(file, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
}
