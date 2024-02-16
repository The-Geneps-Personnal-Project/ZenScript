// deno-lint-ignore-file
import Parser from "./setup/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";
import Environment from "./runtime/env.ts";
import { MAKE_NUMBER, MAKE_NULL, MAKE_BOOL } from "./runtime/values.ts";
import { createGlobalEnvironment } from "./runtime/env.ts";

run("./test.txt");
// repl();

async function run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnvironment();

    const input = await Deno.readTextFile(filename);
    const ast = parser.produceAST(input);
    const result = evaluate(ast, env);
    console.log(result);
}
function repl() {
    const parser = new Parser();
    const env = new Environment();
    env.define("true", MAKE_BOOL(true), true);
    env.define("false", MAKE_BOOL(false), true);
    env.define("null", MAKE_NULL(), true);
    console.log("Welcome to the REPL! Type in your code and press enter to see the AST.");
    while (true) {
        const sourceCode = prompt("> ");
        if (!sourceCode || sourceCode.includes("exit")) {
            break;
        }
        const ast = parser.produceAST(sourceCode);
        const result = evaluate(ast, env);
        console.log(result);
    }
}