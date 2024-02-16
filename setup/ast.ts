// deno-lint-ignore-file
export type NodeType = 
    // STATEMENTS
    | 'Program'
    | 'VariablesDeclaration'

    // LITTERALS
    | 'Property'
    | 'ObjectLiteral'
    | 'NumericLiteral'
    | 'Identifier'
    | 'BinaryExpression'

    // EXPRESSIONS & STATEMENTS
    | 'AssignmentExpression'
    | 'MemberExpression'
    | 'CallExpression'

    // FUNCTIONS
    | 'UnaryExpression'
    | 'FunctionDeclaration'

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

export interface Expression extends Statement {}

export interface NumericLiteral extends Expression {
    kind: 'NumericLiteral';
    value: Number;
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

export interface UnaryExpression extends Expression {
    kind: 'UnaryExpression';
    operator: string;
    argument: Expression;
}

export interface CallExpression extends Expression {
    kind: 'CallExpression';
    callee: Expression;
    arguments: Expression[];
}

export interface FunctionDeclaration extends Expression {
    kind: 'FunctionDeclaration';
    id: Identifier;
    params: Identifier[];
    body: Statement[];
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
