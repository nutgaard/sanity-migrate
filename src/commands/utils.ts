import { Logger } from 'types';
import { createClient, SanityClient } from '@sanity/client';
import { requireNotNull } from '../utils/type-utils.js';
import { cyan } from '../utils/cli-utils.js';

export type SanityClientConfig = {
    projectId: string;
    dataset: string;
    apiVersion: string;
};
export function getSanityClient(logger: Logger, config: SanityClientConfig): SanityClient {
    const token = requireNotNull(process.env.SANITY_TOKEN, 'Missing SANITY_TOKEN environment variable');
    const { projectId, dataset, apiVersion } = config;

    logger.info(`
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
