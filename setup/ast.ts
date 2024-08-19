export type NodeType = 
    // STATEMENTS
    | 'Program'
    | 'VariablesDeclaration'
    | 'FunctionDeclaration'

    // LITTERALS
    | 'Property'
    | 'ObjectLiteral'
    | 'NumericLiteral'
    | 'StringLiteral'
    | 'Identifier'
    | 'BinaryExpression'
    | 'BooleanLiteral'

    // EXPRESSIONS & STATEMENTS
    | 'AssignmentExpression'
    | 'MemberExpression'
    | 'CallExpression'

export interface Statement {
    kind: NodeType;
}

export interface Program extends Statement {
    kind: 'Program';
    body: Statement[];
}

export interface VariablesDeclaration extends Statement {
    kind: 'VariablesDeclaration';
    constant: boolean;
    identifier: string;
    value?: Expression;
}

export interface FunctionDeclaration extends Statement {
    kind: 'FunctionDeclaration';
    parameters: string[];
    name: string;
    body: Statement[];
    // async : boolean; // TODO: Implement async functions
    // arrow : boolean; // TODO: Implement arrow functions
}

export interface Expression extends Statement {}

export interface NumericLiteral extends Expression {
    kind: 'NumericLiteral';
    value: Number;
}

export interface StringLiteral extends Expression {
    kind: 'StringLiteral';
    value: string;
}

export interface BooleanLiteral extends Expression {
    kind: 'BooleanLiteral';
    value: boolean;

}

export interface Identifier extends Expression {
    kind: 'Identifier';
    symbol: string;
}

/**
 * A binary expression is an expression that consists of a left-hand side, a right-hand side, and an operator.
 * - Supported operators: +, -, *, /, %
 */
export interface BinaryExpression extends Expression {
    kind: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
}

export interface CallExpression extends Expression {
    kind: 'CallExpression';
    callee: Expression;
    arguments: Expression[];
}

export interface AssignmentExpression extends Expression {
    kind: 'AssignmentExpression';
    assign: Expression;
    value: Expression;
}

export interface Property extends Statement {
    kind: 'Property';
    key: string;
    value?: Expression;
}

export interface ObjectLiteral extends Expression {
    kind: 'ObjectLiteral';
    properties: Property[];
}

export interface MemberExpression extends Expression {
    kind: 'MemberExpression';
    object: Expression;
    property: Expression;
    computed: boolean;
}

export interface CallExpression extends Expression {
    kind: 'CallExpression';
    caller: Expression;
    arguments: Expression[];
}
