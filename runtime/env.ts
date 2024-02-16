import {RuntimeValue} from "./values.ts";
import {MAKE_BOOL, MAKE_NULL, MAKE_NATIVE_FUNCTION, MAKE_NUMBER} from "./values.ts";

export function createGlobalEnvironment() {
    const env = new Environment();
    env.define("true", MAKE_BOOL(true), true);
    env.define("false", MAKE_BOOL(false), true);
    env.define("null", MAKE_NULL(), true);

    // Add built-in functions
    env.define("print", MAKE_NATIVE_FUNCTION((args) => {
        console.log(...args);
        return MAKE_NULL();
    }), true);

    env.define("time", MAKE_NATIVE_FUNCTION(() => {
        return MAKE_NUMBER(Date.now());
    }), true);

    return env;
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeValue>;
    private constants: Set<string>;

    constructor(parentEnv?: Environment) {
        const global = parentEnv ? true: false;
        this.parent = parentEnv;
        this.variables = new Map();
        this.constants = new Set();
    }

    public define(name: string, value: RuntimeValue, constant: boolean): RuntimeValue {
        if (this.variables.has(name)) throw `Variable already defined: ${name}`;
        this.variables.set(name, value);
        if (constant) this.constants.add(name);
        return value;
    }

    public assign(name: string, value: RuntimeValue): RuntimeValue {
        const env = this.get(name);
        if (env.constants.has(name)) throw `Cannot reassign to constant: ${name}`;
        env.variables.set(name, value);
        return value;
    }

    public getAt(name: string): RuntimeValue {
        const env = this.get(name);
        return env.variables.get(name) as RuntimeValue;
    }

    public get(name: string): Environment {
        if (this.variables.has(name)) {
            return this
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Undefined variable: '${name}'`);
    }
}