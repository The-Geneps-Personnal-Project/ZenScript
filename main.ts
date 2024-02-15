import Parser from "./setup/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";
repl();

function repl() {
    const parser = new Parser();
    console.log("Welcome to the REPL! Type in your code and press enter to see the AST.");
    while (true) {
        const sourceCode = prompt("> ");
        if (!sourceCode || sourceCode.includes("exit")) {
            break;
        }
        const ast = parser.produceAST(sourceCode);
        const result = evaluate(ast);
        console.log(result);
    }
}