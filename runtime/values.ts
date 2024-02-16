import { Statement } from "../setup/ast.ts";
import Environment from "./env.ts";

export type ValueType = "null" | "number" | "boolean" | "object" | "nativeFunction" | "function";

export interface RuntimeValue {
    type: ValueType;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: null;
}

export interface NumberValue extends RuntimeValue {
    type: "number";
    value: number;
}

export interface BooleanValue extends RuntimeValue {
    type: "boolean";
    value: boolean;
}

export interface ObjectValue extends RuntimeValue {
    type: "object";
    properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;
export interface NativeFunctionValue extends RuntimeValue {
    type: "nativeFunction";
    call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue {
    type: "function";
    name: string;
    parameters: string[];
    declarationEnv: Environment;
    body: Statement[];
}

export function MAKE_NATIVE_FUNCTION(call: FunctionCall) {
    return { type: "nativeFunction", call } as NativeFunctionValue;
}

export function MAKE_NUMBER(n = 0) {
    return { type: "number", value: n } as NumberValue;
}

export function MAKE_NULL() {
    return { type: "null", value: null } as NullValue;
}

export function MAKE_BOOL(b = true) {
    return { type: "boolean", value: b } as BooleanValue;
}