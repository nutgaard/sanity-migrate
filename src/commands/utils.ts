import { createClient, SanityClient } from '@sanity/client';
import { assertNotNull, cyan, log } from '../utils';

export function getSanityClientFromArgs(args: string[], help: string): SanityClient | null {
    const argsWithoutOptions = args.filter((it) => !it.startsWith('--'));
    if (argsWithoutOptions.length !== 3 || args.includes('--help')) {
        log(help);
        return null;
    }

    const [projectId, dataset, apiVersion] = argsWithoutOptions;

    const token = assertNotNull(process.env.SANITY_TOKEN, 'Missing SANITY_TOKEN environment variable');

    log(`
        ${cyan('Configuration:')}
        ProjectId:  ${projectId}
        Dataset:    ${dataset}
        ApiVersion: ${apiVersion}
    `);

    return createClient({
        apiVersion,
        projectId,
        dataset,
        token,
        useCdn: false,
    });
}
