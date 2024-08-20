export enum TokenType {
    // LITERALS
    Number,
    Identifier,
    String,
    Boolean,

    // KEYWORDS
    Let, 
    Const,
    Fn,
    Previous,

    // OPERATORS
    BinaryOperator,
    Equals,
    DoubleEquals,
    NotEquals,
    LogicalAnd,
    LogicalOr,
    LessThan,
    LessThanOrEqual,
    GreaterThan,
    GreaterThanOrEqual,
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
    Sharp, // #
}

const Keywords: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Fn,
    function: TokenType.Fn,
    prev: TokenType.Previous,
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

    /**
     * 
     * @returns an array of tokens from the input
     */
    public getTokens(): Token[] {
        this.consumeToken();
        return this.tokens;
    }

    /**
     * 
     * @returns true if the lexer has reached the end of the input
     */
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
        return /[a-zA-Z]/i.test(char);
    }

    private isString(char: string): boolean {
        return /['"]/.test(char);
    }

    private isBinaryOperator(char: string): boolean {
        return /[-+*/%]/.test(char);
    }

    /**
     * 
     * @returns the next character in the input without advancing the position
     */
    private peek(): string {
        return this.input[this.position];
    }

    /**
     * 
     * @returns the next character in the input and advances the position
     */
    private advance(): string {
        return this.input[this.position++];
    }

    /**
     * Consumes all whitespace characters until a non-whitespace character is found
     */
    private consumeWhitespace(): void {
        while (this.isWhitespace(this.peek())) {
            this.advance();
        }
    }

    private consumeNumber(): string {
        let result = '';
        while (this.isDigit(this.peek()) || this.peek() === '.') {
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

    private consumeComment(): void {
        this.advance(); // Consume the '#'
        while (this.peek() !== '\n' && !this.isEOF()) {
            this.advance();
        }
    }

    private consumeOperator(): string {
        const operator = this.peek();
        this.advance();
        return operator;
    }

    private consumeString(quote: string): string {
        let result = '';
        this.advance(); // Consume the opening quote
        while (this.peek() !== quote && !this.isEOF()) {
            result += this.advance();
        }
        this.advance(); // Consume the closing quote
        return result;
    }
    private consumeLogicalOperator(): Token {
        const char = this.peek();
        this.advance();
        if (char === '&' && this.peek() === '&') {
            this.advance();
            return { type: TokenType.LogicalAnd, value: '&&' };
        }
        if (char === '|' && this.peek() === '|') {
            this.advance();
            return { type: TokenType.LogicalOr, value: '||' };
        }
        if (char === '!' && this.peek() === '=') {
            this.advance();
            return { type: TokenType.NotEquals, value: '!=' };
        }
        throw new Error('Unexpected token: ' + char);
    }
    
    private consumeDoubleEquals(): Token {
        const char = this.advance();
        if (char === '=' && this.peek() === '=') {
            this.advance();
            return { type: TokenType.DoubleEquals, value: '==' };
        } else if (char === '<') {
            if (this.peek() === '=') {
                this.advance();
                return { type: TokenType.LessThanOrEqual, value: '<=' };
            }
            return { type: TokenType.LessThan, value: '<' };
        } else if (char === '>') {
            if (this.peek() === '=') {
                this.advance();
                return { type: TokenType.GreaterThanOrEqual, value: '>=' };
            }
            return { type: TokenType.GreaterThan, value: '>' };
        } else if (char === '=') {
            return { type: TokenType.Equals, value: '=' };
        }
        throw new Error('Unexpected token: ' + char);
    }

    private consumeToken() {
        while (!this.isEOF()) {
            if (this.isWhitespace(this.peek())) {
                this.consumeWhitespace();
                continue;
            }

            if (this.isDigit(this.peek())) {
                const digit = this.consumeNumber();
                this.tokens.push({ type: TokenType.Number, value: digit });
                continue;
            }

            if (this.isLetter(this.peek())) {
                const identifier = this.consumeIdentifier();
                if (identifier === "True" || identifier === "False") {
                    this.tokens.push({ type: TokenType.Boolean, value: identifier === "True" ? "1" : "0" });
                } else if (Keywords.hasOwnProperty(identifier)) {
                    this.tokens.push({ type: Keywords[identifier], value: identifier });
                } else {
                    this.tokens.push({ type: TokenType.Identifier, value: identifier });
                }
                continue;
            }

            if (this.isBinaryOperator(this.peek())) {
                const operator = this.consumeOperator();
                this.tokens.push({ type: TokenType.BinaryOperator, value: operator });
                continue;
            }

            if (this.isString(this.peek())) {
                const quote = this.peek();
                const string = this.consumeString(quote);
                this.tokens.push({ type: TokenType.String, value: string });
                continue;
            }

            if (this.peek() === '#') {
                this.consumeComment();
                continue;
            }

            if (this.peek() === '=') {
                this.tokens.push(this.consumeDoubleEquals());
                continue;
            }

            if (this.peek() === '&' || this.peek() === '|' || this.peek() === '!') {
                this.tokens.push(this.consumeLogicalOperator());
                continue;
            }

            const singleCharTokens: Record<string, TokenType> = {
                '(': TokenType.OpenParen,
                ')': TokenType.CloseParen,
                ';': TokenType.Semicolon,
                ',': TokenType.Comma,
                '.': TokenType.Dot,
                ':': TokenType.Colon,
                '{': TokenType.OpenBrace,
                '}': TokenType.CloseBrace,
                '[': TokenType.OpenBracket,
                ']': TokenType.CloseBracket,
            };

            if (singleCharTokens.hasOwnProperty(this.peek())) {
                const char = this.advance();
                this.tokens.push({ type: singleCharTokens[char], value: char });
                continue;
            }

            throw new Error('Unexpected token: ' + this.peek());
        }
        this.tokens.push({ type: TokenType.EOF, value: 'EndOfFile' });
    }
}
