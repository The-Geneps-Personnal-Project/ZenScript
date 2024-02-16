export type ValueType = "null" | "number" | "boolean" | "object";

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

export function MAKE_NUMBER(n = 0) {
    return { type: "number", value: n } as NumberValue;
}

export function MAKE_NULL() {
    return { type: "null", value: null } as NullValue;
}

export function MAKE_BOOL(b = true) {
    return { type: "boolean", value: b } as BooleanValue;
}