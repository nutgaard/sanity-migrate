import { Command } from './Command';
import { bold, cyan, italic } from '../utils';
import { getSanityClientFromArgs } from './utils';
import { MigrationStatusHandler } from '../MigrationStatusHandler';

const help = `
${cyan('Clean migration document')}
Usage: sanity-migrate clean project_id dataset api_version

${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.
`;

export class CleanCommand extends Command {
    constructor() {
        super();
    }

    cmd() {
        return 'clean';
    }

    help() {
        return help;
    }

    async run(...args: string[]): Promise<void> {
        const client = getSanityClientFromArgs(args, help);
        if (client === null) return;

        await MigrationStatusHandler.clean(client);
    }
}
