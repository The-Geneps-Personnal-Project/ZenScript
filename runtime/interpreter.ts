import { RuntimeValue, NumberValue, StringValue, BooleanValue } from "./values.ts";
import { Statement, NumericLiteral, BinaryExpression, Program, Identifier, VariablesDeclaration, AssignmentExpression, ObjectLiteral, CallExpression, FunctionDeclaration, StringLiteral, BooleanLiteral, MemberExpression} from "../setup/ast.ts";
import Environment from "./env.ts";
import { evaluateBinaryExpression, evaluateIdentifier, evaluateAssignment, evaluateObjectExpression, evaluateCallExpression, evaluateMemberExpression } from "./eval/expressions.ts";
import { evaluateProgram, evaluateVariablesDeclaration, evaluateFunctionDeclaration } from "./eval/statements.ts";

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch (astNode.kind) {
        case "NumericLiteral":
            return { value: (astNode as NumericLiteral).value, type: "number"} as NumberValue;
        case "StringLiteral":
            return { value: (astNode as StringLiteral).value, type: "string"} as StringValue;
        case "BooleanLiteral":
            return { value: (astNode as BooleanLiteral).value, type: "boolean"} as BooleanValue;
        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, env);
        case "ObjectLiteral":
            return evaluateObjectExpression(astNode as ObjectLiteral, env);
        case "CallExpression":
            return evaluateCallExpression(astNode as CallExpression, env);
        case "MemberExpression":
            return evaluateMemberExpression(astNode as MemberExpression, env);
        case "AssignmentExpression":
            return evaluateAssignment(astNode as AssignmentExpression, env);
        case "BinaryExpression":
            return evaluateBinaryExpression(astNode as BinaryExpression, env);
        case "VariablesDeclaration":
            return evaluateVariablesDeclaration(astNode as VariablesDeclaration, env);
        case "FunctionDeclaration":
            return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);
        case "Program":
            return evaluateProgram(astNode as Program, env);
        default:
            console.error("Unknown AST node: ", astNode);
            process.exit(0);
    }
}