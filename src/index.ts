import caporal from '@caporal/core';
import { Install } from './commands/InstallCommand.js';
import { Uninstall } from './commands/UninstallCommand.js';
import { Migrate } from './commands/MigrateCommand.js';
import { Clean } from './commands/CleanCommand.js';
import { Status } from './commands/StatusCommand.js';

const { program } = caporal;

program.name('sanity-migrate').bin('sanity-migrate').description('Utility for managing migration in a sanity dataset');

Install.register(program);
Uninstall.register(program);
Migrate.register(program);
Clean.register(program);
Status.register(program);

program.run();
