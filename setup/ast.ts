export type NodeType = 
    | 'Program'
    | 'NumericLiteral'
    | 'Identifier'
    | 'BinaryExpression'
    | 'UnaryExpression'
    | 'CallExpression'
    | 'FunctionDeclaration'
    | 'NullLiteral'

export interface Statement {
    kind: NodeType;
}

export interface Program extends Statement {
    kind: 'Program';
    body: Statement[];
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

export interface NullLiteral extends Expression {
    kind: 'NullLiteral';
    value: null;
}
