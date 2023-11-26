import { SanityClient, SanityDocument } from '@sanity/client';
import { Logger } from 'types';
import { requireNotNull } from './utils/type-utils.js';
import { MigrationFile } from './Migrator.js';

export const SANITY_DOC_TYPE = 'sanity-migrate.migration';
export const SANITY_DOC_ID = 'sanity-migrate.migration';

export type SanityMigrationStatus = 'in_progress' | 'failure' | 'ok';
export interface SanityMigration {
    file: string;
    hash: string;
    status: SanityMigrationStatus;
}
export interface MigrationDocument {
    migrations: Array<SanityMigration>;
}

export class MigrationStatusHandler {
    static async initialize(client: SanityClient, logger: Logger) {
        const existingDoc = await client.getDocument<MigrationDocument>(SANITY_DOC_ID);
        if (existingDoc) {
            logger.info(`Migration document already exists`);
            return;
        }

        await client.createIfNotExists({
            _id: SANITY_DOC_ID,
            _type: SANITY_DOC_TYPE,
            migrations: [],
        });

        logger.info(`Migration document created`);
    }

    static async remove(client: SanityClient) {
        await client.delete(SANITY_DOC_ID);
    }

    static async clean(client: SanityClient) {
        await MigrationStatusHandler.patchMigration(client, () => []);
    }

    static async getStatus(client: SanityClient): Promise<SanityDocument<MigrationDocument>> {
        return requireNotNull(
            await MigrationStatusHandler.getStatusOrNull(client),
            'Could not get MigrationStatus document',
        );
    }

    static async getStatusOrNull(client: SanityClient): Promise<SanityDocument<MigrationDocument> | undefined> {
        return await client.getDocument<MigrationDocument>(SANITY_DOC_ID);
    }

    static async startMigration(client: SanityClient, migration: MigrationFile) {
        await MigrationStatusHandler.updateMigrationStatus(client, migration, 'in_progress');
    }

    static async endMigration(client: SanityClient, migration: MigrationFile, ok: boolean) {
        await MigrationStatusHandler.updateMigrationStatus(client, migration, ok ? 'ok' : 'failure');
    }

    private static async updateMigrationStatus(
        client: SanityClient,
        migration: MigrationFile,
        status: SanityMigrationStatus,
    ) {
        await MigrationStatusHandler.patchMigration(client, (document) => {
            const migrationStatus: SanityMigration = {
                file: migration.filename,
                hash: migration.hash,
                status: status,
            };
            const indexOfExisting = document.migrations.findIndex((it) => it.hash === migration.hash);
            if (indexOfExisting >= 0) {
                document.migrations[indexOfExisting] = migrationStatus;
                return document.migrations;
            }

            return [...document.migrations, migrationStatus];
        });
    }

    private static async patchMigration(
        client: SanityClient,
        patch: (document: MigrationDocument) => Array<SanityMigration>,
    ) {
        console.time('patchMigration');
        const document = await MigrationStatusHandler.getStatus(client);
        const migrations = patch(document);
        console.time('patch');
        await client.patch(SANITY_DOC_ID).set({ migrations }).ifRevisionId(document._rev).commit();
        console.timeEnd('patch');
        console.timeEnd('patchMigration');
    }
}
