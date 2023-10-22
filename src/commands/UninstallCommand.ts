import { Command } from './Command';
import { bold, cyan, italic } from '../utils';
import { getSanityClientFromArgs } from './utils';
import { MigrationStatusHandler } from '../MigrationStatusHandler';

const help = `
${cyan('Remove migration document')}
Usage: sanity-migrate uninstall project_id dataset api_version

${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.
`;

export class UninstallCommand extends Command {
    constructor() {
        super();
    }

    cmd() {
        return 'uninstall';
    }

    help() {
        return help;
    }

    async run(...args: string[]): Promise<void> {
        const client = getSanityClientFromArgs(args, help);
        if (client === null) return;

        await MigrationStatusHandler.remove(client);
    }
}
