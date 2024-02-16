import { AssignmentExpression, BinaryExpression, Identifier, ObjectLiteral, CallExpression } from "../../setup/ast.ts";
import Environment from "../env.ts";
import { MAKE_NULL, NumberValue, RuntimeValue, ObjectValue, NativeFunctionValue } from "../values.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue } from "../values.ts";

function evaluateNumericBinaryExpression(left: NumberValue, right: NumberValue, operator: string): NumberValue {
    let result: number;
    switch (operator) {
        case "+":
            result = left.value + right.value;
            break;
        case "-":
            result = left.value - right.value;
            break;
        case "*":
            result = left.value * right.value;
            break;
        case "/":
            result = left.value / right.value;
            break;
        default:
            result = left.value % right.value;
    }
    return { type: "number", value: result }
}

export function evaluateBinaryExpression(binExp: BinaryExpression, env: Environment): RuntimeValue {
    const left = evaluate(binExp.left, env);
    const right = evaluate(binExp.right, env);
    if (left.type == "number" && right.type == "number") {
        return evaluateNumericBinaryExpression(left as NumberValue, right as NumberValue, binExp.operator);
    }
    return MAKE_NULL();
}

export function evaluateIdentifier(identifier: Identifier, env: Environment): RuntimeValue {
    return env.getAt(identifier.symbol);
}

export function evaluateAssignment(node: AssignmentExpression, env: Environment): RuntimeValue {
    if (node.assign.kind !== "Identifier") throw `Invalid assignment expression ${JSON.stringify(node.assign)}`;
    return env.assign((node.assign as Identifier).symbol, evaluate(node.value, env));
}

export function evaluateObjectExpression(obj: ObjectLiteral, env: Environment): RuntimeValue {
    const object = { type: "object", properties: new Map() } as ObjectValue;
    for (const { key, value } of obj.properties) {
        const runtimeValue = (value == undefined) ? env.getAt(key) : evaluate(value, env);
        object.properties.set(key, runtimeValue);
    }
    return object;
}

export function evaluateCallExpression(expr: CallExpression, env: Environment): RuntimeValue {
    const args = expr.arguments.map(arg => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);

    if (fn.type == "nativeFunction") {
        const res = (fn as NativeFunctionValue).call(args, env);
        return res;
    } else if (fn.type == "function") {
        const func = fn as FunctionValue;
        const scope = new Environment(func.declarationEnv);

        for (let i = 0; i < func.parameters.length; i++) {
            //TODO: check if the number of arguments is correct
            scope.define(func.parameters[i], args[i], false);
        }

        let result: RuntimeValue = MAKE_NULL();
        for (const statement of func.body) {
            result = evaluate(statement, scope);
        }

        return result
    }
    
    throw `Invalid call expression ${JSON.stringify(expr)}`;
}