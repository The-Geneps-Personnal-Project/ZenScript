import { AssignmentExpression, BinaryExpression, Identifier } from "../../setup/ast.ts";
import Environment from "../env.ts";
import { MAKE_NULL, NumberValue, RuntimeValue } from "../values.ts";
import { evaluate } from "../interpreter.ts";

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