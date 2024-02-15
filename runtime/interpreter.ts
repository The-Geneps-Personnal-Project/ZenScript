import { RuntimeValue, NumberValue, NullValue } from "./values.ts";
import { Statement, NumericLiteral, BinaryExpression, Program } from "../setup/ast.ts";

function evaluateProgram(program: Program): RuntimeValue {
    for (const statement of program.body) {
        return evaluate(statement);
    }
    return { type: "null", value: "null" } as NullValue;

}

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

function evaluateBinaryExpression(binExp: BinaryExpression): RuntimeValue {
    const left = evaluate(binExp.left);
    const right = evaluate(binExp.right);
    if (left.type == "number" && right.type == "number") {
        return evaluateNumericBinaryExpression(left as NumberValue, right as NumberValue, binExp.operator);
    }
    return { type: "null", value: "null" } as NullValue;

}

export function evaluate(astNode: Statement): RuntimeValue {
    switch (astNode.kind) {

        case "NumericLiteral":
            return { value: (astNode as NumericLiteral).value, type: "number"} as NumberValue;
        case "NullLiteral":
            return { value: "null", type: "null"} as NullValue;
        case "BinaryExpression":
            return evaluateBinaryExpression(astNode as BinaryExpression);
        case "Program":
            return evaluateProgram(astNode as Program);
        default:
            console.error("Unknown AST node: ", astNode);
    }
}