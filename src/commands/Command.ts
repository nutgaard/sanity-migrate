export abstract class Command {
    abstract cmd(): string;
    abstract help(): string;
    abstract run(...args: string[]): Promise<void>;
}
