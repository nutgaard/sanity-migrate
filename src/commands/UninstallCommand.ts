import { ActionParameters } from 'types';
import { Program } from 'program/index';
import { bold, italic } from '../utils/cli-utils.js';
import { getSanityClient, SanityClientConfig } from './utils.js';
import { MigrationStatusHandler } from '../MigrationStatusHandler.js';

export class Uninstall {
    static register(program: Program) {
        program
            .command('uninstall', 'Uninstall sanity-migrate')
            .argument('<projectId>', 'The sanity projectID')
            .argument('<dataset>', 'The sanity dataset name')
            .argument('<apiVersion>', 'The sanity apiversion to use')
            .help(`${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.`)
            .action(Uninstall.run);
    }

    static async run({ logger, args }: ActionParameters) {
        const client = getSanityClient(logger, args as unknown as SanityClientConfig);
        await MigrationStatusHandler.remove(client);
    }
}
