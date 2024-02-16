import { RuntimeValue, NumberValue } from "./values.ts";
import { Statement, NumericLiteral, BinaryExpression, Program, Identifier, VariablesDeclaration, AssignmentExpression, ObjectLiteral, CallExpression } from "../setup/ast.ts";
import Environment from "./env.ts";
import { evaluateBinaryExpression, evaluateIdentifier, evaluateAssignment, evaluateObjectExpression, evaluateCallExpression } from "./eval/expressions.ts";
import { evaluateProgram, evaluateVariablesDeclaration } from "./eval/statements.ts";

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch (astNode.kind) {
        case "NumericLiteral":
            return { value: (astNode as NumericLiteral).value, type: "number"} as NumberValue;
        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, env);
        case "ObjectLiteral":
            return evaluateObjectExpression(astNode as ObjectLiteral, env);
        case "CallExpression":
            return evaluateCallExpression(astNode as CallExpression, env);
        case "AssignmentExpression":
            return evaluateAssignment(astNode as AssignmentExpression, env);
        case "BinaryExpression":
            return evaluateBinaryExpression(astNode as BinaryExpression, env);
        case "VariablesDeclaration":
            return evaluateVariablesDeclaration(astNode as VariablesDeclaration, env);
        case "Program":
            return evaluateProgram(astNode as Program, env);
        default:
            console.error("Unknown AST node: ", astNode);
            Deno.exit(0);
    }
}