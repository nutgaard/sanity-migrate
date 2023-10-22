import { Command } from './Command';
import { bold, cyan, green, italic, log, red } from '../utils';
import { getSanityClientFromArgs } from './utils';
import { MigrationStatusHandler, SanityMigration } from '../MigrationStatusHandler';

const help = `
${cyan('Get migration status')}
Usage: sanity-migrate status project_id dataset api_version

${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.
`;

export class StatusCommand extends Command {
    constructor() {
        super();
    }

    cmd() {
        return 'status';
    }

    help() {
        return help;
    }

    async run(...args: string[]): Promise<void> {
        const client = getSanityClientFromArgs(args, help);
        if (client === null) return;

        const status = await MigrationStatusHandler.getStatus(client);
        log(status.migrations.map((it) => `${getStatus(it)}: ${it.file} (${it.hash.slice(0, 6)})`).join('\n'));
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
