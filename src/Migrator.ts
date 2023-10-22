import { SanityClient, PatchOperations } from '@sanity/client';
import { cyan, green, log, red } from './utils/cli-utils.ts';
import { MigrationStatusHandler, SanityMigration } from './MigrationStatusHandler.ts';

export interface MigrationFile {
    filename: string;
    hash: string;
    module: MigrationModule;
}

export interface MigrationModule {
    name: string;
    query: string;
    buildPatch(doc: any): PatchedDocument;
}

export interface Config {
    dryrun: boolean;
}

export interface PatchedDocument {
    id: string;
    patch: PatchOperations;
}

export class Migrator {
    constructor(
        private client: SanityClient,
        private migrations: MigrationFile[],
        private config: Config,
    ) {}

    static verifyModule(module: any): MigrationModule | undefined {
        if (typeof module === 'object' && module !== null) {
            const name = module?.name ?? module?.migration?.name;
            const query = module?.query ?? module?.migration?.query;
            const buildPatch = module?.buildPatch ?? module?.migration?.buildPatch;

            if (name && query && buildPatch && typeof buildPatch === 'function') {
                return { name, query, buildPatch };
            }
        }
        return undefined;
    }

    async run() {
        const migrationToRun = await this.checkPreviousMigrations();
        log(cyan('INFO'), `Found ${migrationToRun.length} migrations to run.`);

        for (const migration of migrationToRun) {
            const { name, query, buildPatch } = migration.module;
            await MigrationStatusHandler.startMigration(this.client, migration);

            let patches: PatchedDocument[] = [];
            let batchCount = 1;
            do {
                log(cyan('INFO'), `Starting migration "${name}"`);
                try {
                    patches = (await this.client.fetch(query)).map(buildPatch);
                    log(
                        cyan('INFO'),
                        `Migration batch (${batchCount++}): ${patches.length} documents\n`,
                        patches.map((patch) => `  ${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
                    );

                    const transaction = this.client.transaction();
                    for (const patch of patches) {
                        transaction.patch(patch.id, patch.patch);
                    }
                    await transaction.commit({ dryRun: this.config.dryrun });
                } catch (e) {
                    log(red('KO'), `Migration ${name} failed.`);
                    await MigrationStatusHandler.endMigration(this.client, migration, false);
                    console.log(e);
                    process.exit(1);
                }
            } while (patches.length > 0 && !this.config.dryrun);
            await MigrationStatusHandler.endMigration(this.client, migration, true);

            log(green('OK'), `Migration "${name}" complete`);
            if (this.config.dryrun) {
                log(
                    cyan('INFO'),
                    `This was a dryrun, which means only one iteration of document-fetching was performed.`,
                );
            }
        }
    }

    private async checkPreviousMigrations(): Promise<MigrationFile[]> {
        log(cyan('INFO'), `Fetching previous migration status.`);
        const migrationStatus = await MigrationStatusHandler.getStatusOrNull(this.client);
        if (!migrationStatus) {
            log(red('KO'), `No migration status found, run sanity-migrate init before trying to migrate data.`);
            process.exit(1);
        }
        const previousMigrations = migrationStatus.migrations;

        if (previousMigrations.some((it) => it.status !== 'ok')) {
            log(
                red('KO'),
                `Previous migration not completed successfully. Wait if another migration is currently running, or fix it manually.`,
            );
            process.exit(1);
        }

        for (let i = 0; i < previousMigrations.length; i++) {
            const { file, hash } = previousMigrations[i];

            const currentFileMatch = this.migrations.find((it) => it.filename === file);
            if (!currentFileMatch) {
                log(
                    red('KO'),
                    `Could not find previously run migration; ${file}. Ensure filenames do not change after applying the migration.`,
                );
                process.exit(1);
            }
            if (currentFileMatch.hash !== hash) {
                log(red('KO'), `Hash mismatch for; ${file}. Migration files cannot change after being applied.`);
                process.exit(1);
            }
        }

        return this.findUnrunMigrations(previousMigrations);
    }

    private findUnrunMigrations(previousMigrations: Array<SanityMigration>): MigrationFile[] {
        const previousMigrationLUT: Record<string, SanityMigration> = previousMigrations.reduce(
            (acc, it) => {
                acc[it.hash] = it;
                return acc;
            },
            {} as Record<string, SanityMigration>,
        );

        return this.migrations.filter((it) => {
            const previous = previousMigrationLUT[it.hash];
            return !previous;
        });
    }
}
