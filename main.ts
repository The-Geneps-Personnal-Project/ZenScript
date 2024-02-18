// deno-lint-ignore-file
import Parser from "./setup/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { createGlobalEnvironment } from "./runtime/env.ts";

run(Deno.args[0]);

async function run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnvironment();

    const input = await Deno.readTextFile(filename);
    const ast = parser.produceAST(input);
    const result = evaluate(ast, env);
}