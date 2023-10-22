import {
    CleanCommand,
    Command,
    CommandManager,
    HelpCommand,
    InstallCommand,
    MigrateCommand,
    StatusCommand,
    UninstallCommand,
} from './commands';

const commandManager = new CommandManager();
commandManager.register(new InstallCommand());
commandManager.register(new StatusCommand());
commandManager.register(new MigrateCommand());
commandManager.register(new CleanCommand());
commandManager.register(new UninstallCommand());
commandManager.register(new HelpCommand(commandManager));

const [, , commandArg, ...rest] = process.argv;

let command: Command | undefined = commandManager.get(commandArg);
if (command === undefined) {
    command = commandManager.get('help')!;
}

await command.run(...rest);
