import {RuntimeValue} from "./values.ts";

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeValue>;
    private constants: Set<string>;

    constructor(parentEnv?: Environment) {
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