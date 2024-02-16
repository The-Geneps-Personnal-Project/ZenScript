// deno-lint-ignore-file
import {Token, TokenType, Lexer} from './lexer.ts';
import {Program, Statement, NumericLiteral, Identifier, CallExpression, FunctionDeclaration, Expression, BinaryExpression, VariablesDeclaration, AssignmentExpression, Property, ObjectLiteral, MemberExpression} from './ast.ts';

export default class Parser {
    private tokens: Token[] = [];

    private isEOF(): boolean {
        return this.tokens[0].type == TokenType.EOF;
    }

    private at() : Token {
        return this.tokens[0] as Token;
    }

    private consume(): Token {
        return this.tokens.shift() as Token;
    }

    private expect(type: TokenType, error: any) {
        const prev = this.consume() as Token;
        if (!prev || prev.type != type) {
            console.error("Parser error: " + error + " at " + prev.value, "Expected: " + type);
            Deno.exit(1);
        }

        return prev;
    }

    public produceAST(sourceCode : string): Program {
        const lexer = new Lexer(sourceCode);
        this.tokens = lexer.getTokens();

        const program: Program = {
            kind: 'Program',
            body: []
        };

        while (!this.isEOF()) {
            program.body.push(this.parse_statement());
        }
        return program;
    }

    private parse_statement(): Statement {
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_variable_declaration();
            case TokenType.Fn:
                return this.parse_function_declaration();
            default:
                return this.parse_expression();
        }
    }

    private parse_function_declaration(): FunctionDeclaration {
        this.consume(); // Skip Fn
        const name = this.expect(TokenType.Identifier, "Expected function name").value;

        const args: string[] = [];
        for (const arg of this.parse_arguments()) {
            if (arg.kind !== "Identifier") throw "Expected identifier as function argument";
            args.push((arg as Identifier).symbol);
        }

        this.expect(TokenType.OpenBrace, "Expected opening brace after function declaration");

        const body: Statement[] = [];

        while (this.at().type != TokenType.EOF && this.at().type != TokenType.CloseBrace) {
            body.push(this.parse_statement());
        }

        this.expect(TokenType.CloseBrace, "Expected closing brace after function declaration");
        const fn = {
            body, name, parameters: args, kind: "FunctionDeclaration"
        } as FunctionDeclaration;

        return fn;
    }

    private parse_variable_declaration(): Statement {
        const constant = this.consume().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier Let or Const keyword").value;

        if (this.at().type == TokenType.Semicolon) {
            this.consume();
            if (constant) throw "Constant must be initialized";
            return {kind: "VariablesDeclaration", identifier, constant: false} as VariablesDeclaration
        }

        this.expect(TokenType.Equals, "Expected equals sign");
        const declaration = {kind: "VariablesDeclaration", constant, value: this.parse_expression(), identifier} as VariablesDeclaration;
        this.expect(TokenType.Semicolon, "Expected semicolon at the end of variable declaration statement");
        return declaration;
    }

    private parse_expression(): Expression {
        return this.parse_assignment_expression();
    }

    private parse_object_expression(): Expression {
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parse_additive_expression();
        }

        this.consume(); // Skip Open Brace
        const properties = new Array<Property>();
        while (!this.isEOF() && this.at().type != TokenType.CloseBrace) {
            const key = this.expect(TokenType.Identifier, "Object Literal key expetect").value;

            // Allow shortand key: pair -> {key,}
            if (this.at().type == TokenType.Comma) {
                this.consume(); // Skip Comma
                properties.push({kind: "Property", key} as Property);
                continue;
            } else if (this.at().type == TokenType.CloseBrace) {
                properties.push({kind: "Property", key} as Property);
                continue;
            }

            this.expect(TokenType.Colon, "Expected colon after Identifier in Object Literal");
            const value = this.parse_expression(); // Allow any expression as value

            properties.push({kind: "Property", key, value});
            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "Expected comma or closing bracket after property");
            }
        }

        this.expect(TokenType.CloseBrace, "Expected closing brace");
        return {kind: "ObjectLiteral", properties} as ObjectLiteral;
    }

    private parse_assignment_expression(): Expression {
        const left = this.parse_object_expression();

        if (this.at().type == TokenType.Equals) {
            this.consume();
            const value = this.parse_assignment_expression();
            return {value, assign: left, kind: "AssignmentExpression"} as AssignmentExpression;
        }
        return left;
    }

    private parse_multiplicative_expression(): Expression {
        let left = this.parse_call_member_expression();
        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%"){
            const operator = this.consume().value;
            const right = this.parse_call_member_expression();
            left = { kind: "BinaryExpression", operator, left, right } as BinaryExpression;
        }
        return left;
    }

    private parse_call_member_expression(): Expression {
        const member = this.parse_member_expression();

        if (this.at().type == TokenType.OpenParen) {
            return this.parse_call_expression(member);
        }
        return member
    }

    private parse_call_expression(caller: Expression): Expression {
        let call_expr: Expression = {
            kind: "CallExpression",
            caller,
            arguments: this.parse_arguments()
        } as CallExpression;

        if (this.at().type == TokenType.OpenParen) {
            call_expr = this.parse_call_expression(call_expr);
        }
        
        return call_expr;
    }

    private parse_arguments(): Expression[] {
        this.expect(TokenType.OpenParen, "Expected opening parenthesis");

        const args = this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();

        this.expect(TokenType.CloseParen, "Expected closing parenthesis");
        return args;
    }

    private parse_arguments_list(): Expression[] {
        const args = [this.parse_assignment_expression()];

        while (this.at().type == TokenType.Comma && this.consume()) {
            args.push(this.parse_assignment_expression());
        }

        return args;
    }

    private parse_member_expression(): Expression {
        let object = this.parse_primary_expression();

        while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket){
            const operator = this.consume();
            let property: Expression;
            let computed: boolean;

            if (operator.type == TokenType.Dot) {
                property = this.parse_primary_expression(); // Get identifier
                computed = false;
                if (property.kind !== "Identifier") throw "Expected identifier after dot operator";
            } else {
                property = this.parse_expression();
                computed = true;
                this.expect(TokenType.CloseBracket, "Expected closing bracket");
            }

            object = { kind: "MemberExpression", object, property, computed } as MemberExpression;
        }

        return object
    }

    private parse_additive_expression(): Expression {
        let left = this.parse_multiplicative_expression();
        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.consume().value;
            const right = this.parse_multiplicative_expression();
            left = { kind: "BinaryExpression", operator, left, right } as BinaryExpression;
        }
        return left;
    }

    private parse_primary_expression(): Expression {
        const token = this.at().type;
        switch (token) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.consume().value } as Identifier;
            case TokenType.Number:
                return { kind: "NumericLiteral", value: parseFloat(this.consume().value) } as NumericLiteral;
            case TokenType.OpenParen:
                this.consume();
                const expression = this.parse_expression();
                this.expect(
                    TokenType.CloseParen,
                    "Expected closing parenthesis"
                );
                return expression;
            default:
                console.error("Unexpected token: " + JSON.stringify(this.at()));
                Deno.exit(1);
        }
    }
}