import { ActionParameters } from 'types';
import { Program } from 'program/index';
import { bold, italic } from '../utils/cli-utils.js';
import { getSanityClient, SanityClientConfig } from './utils.js';
import { MigrationStatusHandler } from '../MigrationStatusHandler.js';

export class Clean {
    static register(program: Program) {
        program
            .command('clean', 'Clean sanity-migrate document')
            .argument('<projectId>', 'The sanity projectID')
            .argument('<dataset>', 'The sanity dataset name')
            .argument('<apiVersion>', 'The sanity apiversion to use')
            .help(`${bold('NB!!')} ${italic('SANITY_TOKEN')} must be provided as environment variable.`)
            .action(Clean.run);
    }

    static async run({ logger, args }: ActionParameters) {
        const client = getSanityClient(logger, args as unknown as SanityClientConfig);
        await MigrationStatusHandler.clean(client);
    }
}
