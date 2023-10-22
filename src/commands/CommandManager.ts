import { Command } from './Command';

export class CommandManager {
    private commands: Map<string, Command> = new Map();

    register(command: Command) {
        this.commands.set(command.cmd(), command);
    }

    list(): Command[] {
        return Array.from(this.commands.values());
    }

    get(name: string): Command | undefined {
        return this.commands.get(name);
    }
}
