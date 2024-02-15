import {Token, TokenType, Lexer} from './lexer.ts';
import {Program, Statement, NumericLiteral, Identifier, CallExpression, FunctionDeclaration, Expression, BinaryExpression, NullLiteral} from './ast.ts';

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
        return this.parse_expression();
    }

    private parse_expression(): Expression {
        return this.parse_additive_expression();
    }

    private parse_multiplicative_expression(): Expression {
        let left = this.parse_primary_expression();
        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%"){
            const operator = this.consume().value;
            const right = this.parse_primary_expression();
            left = { kind: "BinaryExpression", operator, left, right } as BinaryExpression;
        }
        return left;
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
            case TokenType.Null:
                this.consume();
                return { kind: "NullLiteral", value: null } as NullLiteral;
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
                console.error("Unexpected token: " + this.at());
                Deno.exit(1);
        }
    }
}