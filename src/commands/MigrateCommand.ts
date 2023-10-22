import { Command } from './Command';
import { bold, checksumFile, cyan, findFiles, importAll, italic, log, red } from '../utils';
import path from 'node:path';
import { MigrationFile, Migrator } from '../Migrator.ts';
import { getSanityClientFromArgs } from './utils';

export const help = `
${cyan('Run migration')}
Usage: sanity-migrate migrate project_id dataset api_version [options]
--dry-run           Runs migrations without commiting transactions
--src=migrations    Source folder for migrations
--help              Prints the help for the command

${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.
`;

export class MigrateCommand extends Command {
    cmd() {
        return 'migrate';
    }
    help() {
        return help;
    }

    async run(...args: string[]): Promise<void> {
        const client = getSanityClientFromArgs(args, help);
        if (client === null) return;

        const dryrun = args.includes('--dry-run') ?? false;
        const src =
            args
                .filter((it) => it.startsWith('--src='))
                .map((it) => it.split('=')[1])
                .at(0) ?? 'migrations';

        const migrationSource = path.join(process.env.PWD ?? '', src);
        const migrationFiles = (await findFiles(migrationSource)).sort();
        log(`Found ${migrationFiles.length} migrations at ${migrationSource}`);

        const migrations = await loadMigrationFiles(migrationFiles);
        if (!migrations.every(Boolean)) {
            log(red('KO'), 'Found migrations with errors. Stopping...');
            process.exit(1);
        }

        const migrator = new Migrator(client, migrations as MigrationFile[], {
            dryrun,
        });

        await migrator.run();
    }
}

async function loadMigrationFiles(files: string[]): Promise<Array<MigrationFile | undefined>> {
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
            log(
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
