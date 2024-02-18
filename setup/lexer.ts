export enum TokenType {
    // LITERALS
    Number,
    Identifier,
    String,

    // KEYWORDS
    Let, 
    Const,
    Fn,

    // OPERATORS
    BinaryOperator,
    Equals,
    Comma,
    Dot,
    Colon,
    Semicolon,
    OpenParen, 
    CloseParen,
    OpenBrace, // {
    CloseBrace, // }
    OpenBracket, // [
    CloseBracket, // ]
    EOF,
}

const Keywords: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Fn,
}

export interface Token {
    type: TokenType;
    value: string;
}

export class Lexer {
    private input: string;
    private position: number;
    private tokens = new Array<Token>();

    constructor(input: string) {
        this.input = input;
        this.position = 0;
    }

    public getTokens(): Token[] {
        this.consumeToken();
        return this.tokens;
    }

    private isEOF(): boolean {
        return this.position >= this.input.length;
    }

    private isWhitespace(char: string): boolean {
        // Check space, tab, newline, carriage return
        return /\s/.test(char);
    }

    private isDigit(char: string): boolean {
        return /\d/.test(char);
    }

    private isLetter(char: string): boolean {
        return /[a-z]/i.test(char);
    }

    private isString(char: string): boolean {
        return /['"]/.test(char);
    }

    private isOperator(char: string): boolean {
        return /[-+*/%]/.test(char);
    }

    private peek(): string {
        return this.input[this.position];
    }

    private advance(): string {
        return this.input[this.position++];
    }

    private consumeWhitespace(): void {
        while (this.isWhitespace(this.peek())) {
            this.advance();
        }
    }

    private consumeNumber(): string {
        let result = '';
        while (this.isDigit(this.peek())) {
            result += this.advance();
        }
        return result;
    }

    private consumeIdentifier(): string {
        let result = '';
        while (this.isLetter(this.peek()) && !this.isEOF()) {
            result += this.advance();
        }
        return result;
    }

    private consumeOperator(): string {
        const operator = this.peek();
        this.advance();
        return operator;
    }

    private consumeToken() {
        while (!this.isEOF()) {
            if (this.isWhitespace(this.peek())) {
                this.consumeWhitespace();
                continue;
            }

            else if (this.isDigit(this.peek())) {
                const digit = this.consumeNumber();
                this.tokens.push({ type: TokenType.Number, value: digit});
            }

            else if (this.isLetter(this.peek())) {
                const identifier = this.consumeIdentifier();
                if (typeof Keywords[identifier] == "number") this.tokens.push({ type: Keywords[identifier], value: identifier})
                else this.tokens.push({ type: TokenType.Identifier, value: identifier});
            }

            else if (this.isOperator(this.peek())) {
                const operator = this.consumeOperator();
                this.tokens.push({ type: TokenType.BinaryOperator, value: operator });
            }

            else if (this.isString(this.peek())) {
                const quote = this.advance();
                let string = '';
                while (this.peek() !== quote) {
                    string += this.advance();
                }
                this.advance();
                this.tokens.push({ type: TokenType.String, value: string });
            }

            else if (this.peek() === '=') {this.advance(); this.tokens.push({ type: TokenType.Equals, value: "="})}
            else if (this.peek() === '(') {this.advance(); this.tokens.push({ type: TokenType.OpenParen, value: "("})}
            else if (this.peek() === ')') {this.advance(); this.tokens.push({ type: TokenType.CloseParen, value: ")"})}
            else if (this.peek() === ';') {this.advance(); this.tokens.push({ type: TokenType.Semicolon, value: ";"})}
            else if (this.peek() === ',') {this.advance(); this.tokens.push({ type: TokenType.Comma, value: ","})}
            else if (this.peek() === '.') {this.advance(); this.tokens.push({ type: TokenType.Dot, value: "."})}
            else if (this.peek() === ':') {this.advance(); this.tokens.push({ type: TokenType.Colon, value: ":"})}
            else if (this.peek() === '{') {this.advance(); this.tokens.push({ type: TokenType.OpenBrace, value: "{"})}
            else if (this.peek() === '}') {this.advance(); this.tokens.push({ type: TokenType.CloseBrace, value: "}"})}
            else if (this.peek() === '[') {this.advance(); this.tokens.push({ type: TokenType.OpenBracket, value: "["})}
            else if (this.peek() === ']') {this.advance(); this.tokens.push({ type: TokenType.CloseBracket, value: "]"})}
            else throw new Error('Unexpected token: ' + this.peek());
        }
        this.tokens.push({ type: TokenType.EOF, value: 'EndOfFile' });
    }
}