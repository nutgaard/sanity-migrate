import path from 'node:path';
import { Program } from 'program/index';
import { ActionParameters, Logger } from 'types';
import { bold, italic, red } from '../utils/cli-utils.js';
import { getSanityClient, SanityClientConfig } from './utils.js';
import { checksumFile, findFiles, importAll } from '../utils/fs-utils.js';
import { MigrationFile, Migrator } from '../Migrator.js';

export class Migrate {
    static register(program: Program) {
        program
            .command('migrate', 'Run sanity-migrate migrations')
            .argument('<projectId>', 'The sanity projectID')
            .argument('<dataset>', 'The sanity dataset name')
            .argument('<apiVersion>', 'The sanity apiversion to use')
            .option('--dry-run', 'Runs migrations without commiting transaction')
            .option('--src <folder>', 'Source folder for migrations', {
                default: 'migrations',
                validator: (value) => {
                    if (typeof value === 'string') {
                        return Promise.resolve(value);
                    } else {
                        return Promise.reject('Must pass a folder to --src');
                    }
                },
            })
            .help(`${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.`)
            .action(Migrate.run);
    }

    static async run({ logger, args, options }: ActionParameters) {
        const client = getSanityClient(logger, args as unknown as SanityClientConfig);

        const dryrun = Boolean(options['dryRun']);
        const sourceFolder = `${options['src']}`;

        const migrationSource = path.join(process.env.PWD ?? '', sourceFolder);
        const migrationFiles = (await findFiles(migrationSource)).sort();
        logger.info(`Found ${migrationFiles.length} migrations at ${migrationSource}`);

        const migrations = await loadMigrationFiles(migrationFiles, logger);
        if (!migrations.every(Boolean)) {
            logger.error(red('KO'), 'Found migrations with errors. Stopping...');
            process.exit(1);
        }

        const migrator = new Migrator(client, migrations as MigrationFile[], {
            dryrun,
        });

        await migrator.run(logger);
    }
}

async function loadMigrationFiles(files: string[], logger: Logger): Promise<Array<MigrationFile | undefined>> {
    const out: Array<MigrationFile | undefined> = [];
    const migrationModules = await importAll<any>(files);

    for (let i = 0; i < files.length; i++) {
        const file = files.at(i) ?? '';
        const module = Migrator.verifyModule(migrationModules.at(i));
        const hash = await checksumFile(file);

        if (module) {
            out.push({
                filename: path.basename(file),
                module,
                hash,
            });
        } else {
            logger.error(
                red('KO'),
                `Error in ${path.basename(file)}. Migration module must return a ${italic(
                    'Migration',
                )} object, or export ${italic('name')}, ${italic('query')} and ${italic('buildPatch')}.`,
            );
            out.push(undefined);
        }
    }

    return out;
}
