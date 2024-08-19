import Parser from './setup/parser';
import { evaluate } from './runtime/interpreter';
import Environment, { createGlobalEnvironment } from './runtime/env';
import { RuntimeValue } from './runtime/values';
import { exit } from 'process';

run(Bun.argv[2]);

function execute(input: string, parser: Parser, env: Environment): RuntimeValue {
    const ast = parser.produceAST(input);
    return evaluate(ast, env);
}

async function runFile(filename: string, parser: Parser, env: Environment) {
    const input = Bun.file(filename);
    execute(await input.text(), parser, env);
}

async function runPrompt(message: string, parser: Parser, env: Environment) {
    process.stdout.write(message);
    for await (const line of console) {
        if (line === "exit") exit(0);
        const result = execute(line, parser, env);
        if (result.value) console.log(result.value);
        process.stdout.write(message);
    }
}

async function run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnvironment();

    if (filename) {
        await runFile(filename, parser, env);
    } else {
        runPrompt('>> ', parser, env);
    }
}
