import { AssignmentExpression, BinaryExpression, Identifier, ObjectLiteral, CallExpression, MemberExpression } from "../../setup/ast.ts";
import Environment from "../env.ts";
import { MAKE_NULL, NumberValue, RuntimeValue, ObjectValue, NativeFunctionValue, StringValue, BooleanValue } from "../values.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue } from "../values.ts";

function evaluateNumericBinaryExpression(left: NumberValue, right: NumberValue, operator: string): NumberValue {
    const operations: { [key: string]: (a: number, b: number) => number } = {
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "*": (a, b) => a * b,
        "/": (a, b) => a / b,
        "%": (a, b) => a % b,
    };

    const result = operations[operator](left.value, right.value);
    return { type: "number", value: result };
}

function evaluateStringBinaryExpression(left: StringValue, right: StringValue, operator: string): StringValue {
    if (operator !== "+") throw new Error("Invalid operator for string");
    return { type: "string", value: left.value + right.value };
}

function evaluateMixedBinaryExpression(left: RuntimeValue, right: RuntimeValue, operator: string): RuntimeValue {
    let leftValue: any = left.value;
    let rightValue: any = right.value;

    if (left.type === "boolean") {
        leftValue = left.value ? 1 : 0;
    }
    if (right.type === "boolean") {
        rightValue = right.value ? 1 : 0;
    }

    // Handle number and string combinations
    if ((left.type === "number" || left.type === "boolean") && (right.type === "number" || right.type === "boolean")) {
        return evaluateNumericBinaryExpression({ type: "number", value: leftValue }, { type: "number", value: rightValue }, operator);
    }
    if (left.type === "string" || right.type === "string") {
        return evaluateStringBinaryExpression({ type: "string", value: String(leftValue) }, { type: "string", value: String(rightValue) }, operator);
    }

    throw new Error(`Invalid operator or types for mixed binary expression: ${left.type} and ${right.type}`);
}

function evaluateBooleanBinaryExpression(left: BooleanValue, right: BooleanValue, operator: string): BooleanValue {
    const operations: { [key: string]: (a: boolean, b: boolean) => boolean } = {
        "&&": (a, b) => a && b,
        "||": (a, b) => a || b,
        "==": (a, b) => a === b,
        "!=": (a, b) => a !== b,
    };

    if (!(operator in operations)) throw new Error(`Invalid operator for booleans: ${operator}`);

    const result = operations[operator](left.value, right.value);
    return { type: "boolean", value: result };
}

export function evaluateBinaryExpression(binExp: BinaryExpression, env: Environment): RuntimeValue {
    const left = evaluate(binExp.left, env);
    const right = evaluate(binExp.right, env);

    if (left.type === "number" && right.type === "number") {
        return evaluateNumericBinaryExpression(left as NumberValue, right as NumberValue, binExp.operator);
    }

    if (left.type === "string" && right.type === "string") {
        return evaluateStringBinaryExpression(left as StringValue, right as StringValue, binExp.operator);
    }

    if (left.type === "boolean" && right.type === "boolean") {
        return evaluateBooleanBinaryExpression(left as BooleanValue, right as BooleanValue, binExp.operator);
    }

    if ((left.type === "number" || left.type === "string" || left.type === "boolean") && (right.type === "number" || right.type === "string" || right.type === "boolean")) {
        return evaluateMixedBinaryExpression(left, right, binExp.operator);
    }

    throw new Error(`Invalid types for binary expression: ${left.type} and ${right.type}`);
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

export function evaluateMemberExpression(expr: MemberExpression, env: Environment): RuntimeValue {
    const object = evaluate(expr.object, env);

    if (object.type !== 'object') {
        throw new Error(`Cannot access property of non-object type: ${object.type}`);
    }

    let propertyName: string;
    if (expr.property.kind === "Identifier") {
        propertyName = (expr.property as Identifier).symbol;
    } else {
        const property = evaluate(expr.property, env);
        console.log("Property evaluated to:", property);

        if (property.type === 'string') {
            propertyName = (property as StringValue).value;
        } else if (property.type === 'number' || property.type === 'boolean') {
            propertyName = property.value.toString();
        } else {
            throw new Error(`Property must be a string, number, or boolean, but got: ${property.type}`);
        }
    }

    const objectValue = object as ObjectValue;
    const propertyValue = objectValue.properties.get(propertyName);

    if (propertyValue === undefined) {
        throw new Error(`Property ${propertyName} does not exist on object`);
    }

    return propertyValue;
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

        if (func.parameters.length !== args.length) throw `Invalid number of arguments for function ${JSON.stringify(func.name)}, expected ${func.parameters.length}, got ${args.length}`;

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