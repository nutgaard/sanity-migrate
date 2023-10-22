import { Command } from './Command';
import { cyan, log } from '../utils';
import { CommandManager } from './CommandManager';

const helpHeader = `${cyan('@nutgaard/sanity-migrate')} - A simple tool for migrating sanity schemas`;
const help = `
${cyan('Print help message')}
Usage: sanity-migrate help
`;

export class HelpCommand extends Command {
    constructor(private commandManager: CommandManager) {
        super();
    }

    cmd() {
        return 'help';
    }

    help() {
        return help;
    }

    async run(...args: string[]): Promise<void> {
        const commands: string = this.commandManager
            .list()
            .map((it) => it.help())
            .join('');

        log([helpHeader, '\n', commands].join(''));

        return;
    }
}
