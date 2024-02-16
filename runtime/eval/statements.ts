import { Program, VariablesDeclaration } from "../../setup/ast.ts";
import { RuntimeValue, MAKE_NULL, FunctionValue } from "../values.ts";
import Environment from "../env.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionDeclaration } from "../../setup/ast.ts";

export function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = MAKE_NULL();
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
    }
    return lastEvaluated
}

export function evaluateVariablesDeclaration(declaration: VariablesDeclaration, env: Environment): RuntimeValue {
    const value = declaration.value ? evaluate(declaration.value, env) : MAKE_NULL();
    return env.define(declaration.identifier, value, declaration.constant);
}

export function evaluateFunctionDeclaration(declaration: FunctionDeclaration, env: Environment): RuntimeValue {
    const fn = {
        type: "function",
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body
    } as FunctionValue;

    return env.define(declaration.name, fn, true);
}