import { ActionParameters } from 'types';
import { Program } from 'program/index';
import { bold, cyan, green, italic, red } from '../utils/cli-utils.js';
import { getSanityClient, SanityClientConfig } from './utils.js';
import { MigrationStatusHandler, SanityMigration } from '../MigrationStatusHandler.js';

export class Status {
    static register(program: Program) {
        program
            .command('status', 'Get migration status')
            .argument('<projectId>', 'The sanity projectID')
            .argument('<dataset>', 'The sanity dataset name')
            .argument('<apiVersion>', 'The sanity apiversion to use')
            .help(`${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.`)
            .action(Status.run);
    }

    static async run({ logger, args }: ActionParameters) {
        const client = getSanityClient(logger, args as unknown as SanityClientConfig);
        const status = await MigrationStatusHandler.getStatus(client);

        logger.info(status.migrations.map((it) => `${getStatus(it)}: ${it.file} (${it.hash.slice(0, 6)})`).join('\n'));
    }
}

function getStatus(document: SanityMigration) {
    switch (document.status) {
        case 'in_progress':
            return `[${cyan('-')}]`;
        case 'ok':
            return `[${green('✓')}]`;
        case 'failure':
            return `[${red('X')}]`;
    }
}
