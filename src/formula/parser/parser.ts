/*
 * Parser is responsible for building an abstract syntax tree (AST)
 */
import { Token, TokenType } from './token';
import { ASTFunctionNode, ASTNode, ASTValueNode, ASTVariableNode } from './node';

export class Parser {
  tokens: Token[];
  index: number;
  flexible: boolean;

  constructor() {
    this.tokens = [];
    this.index = 0;
    this.flexible = false;
  }

  getCurrentToken(): Token {
    return this.tokens[this.index];
  }

  // Return next token
  peekToken(): Token | undefined {
    const advancedIndex: number = this.index + 1;
    return (advancedIndex < this.tokens.length) ? this.tokens[advancedIndex] : undefined;
  }

  unexpectedTokenMessage(): string {
    throw new SyntaxError((
      `Unexpected "${this.getCurrentToken().value}"\n` +
      `formula ${this.getCurrentToken().line}\n` +
      `       ${' '.repeat(this.getCurrentToken().column)}^`
    ));
  }

  // Compare current token type with a TYPE, if matchs, advance to next token, otherwise raise exception
  eat(type: TokenType): void {
    if (this.getCurrentToken().type === type) {
      this.index += 1;
    } else {
      throw new SyntaxError(this.unexpectedTokenMessage());
    }
  }

  // Same as eat() but optionally flexible with token TYPE
  // also returns bool if current token was eated or not
  flexibleEat(type: TokenType): boolean {
    let wasEaten: boolean;

    if (this.flexible) {
      try {
        this.eat(type);
        wasEaten = true;
      } catch {
        wasEaten = false;
      }
    } else {
      this.eat(type);
      wasEaten = true;
    }

    return wasEaten;
  }

  // Build Formula AST node formula : EQUAL entity EOF
  buildFormula(): ASTNode {
    const entity = this.buildEntity();
    this.eat('EOF');
    return entity;
  }

  // Build ASTFunctionNode AST node function : FUNCTION LPAREN (entity COMMA?)+ RPAREN
  buildFunction(): ASTFunctionNode {
    const functionName: string = this.getCurrentToken().value;

    this.eat('FUNCVAR');
    this.eat('LPAREN');

    const args: Array<ASTNode> = [];
    do {
      if (this.getCurrentToken().type === 'COMMA') {
        this.eat('COMMA');
      }
      if (this.flexible && this.getCurrentToken().type === 'EOF') {
        break;
      }
      args.push(this.buildEntity());
    } while (this.getCurrentToken().type === 'COMMA');

    const closed: boolean = this.flexibleEat('RPAREN');

    return { type: 'function', name: functionName, args, closed };
  }

  // Build ASTFunctionNode AST node entity : (function|variable|value)
  buildEntity(): ASTNode {
    switch (this.getCurrentToken().type) {
      case 'FUNCVAR':
        return (this.peekToken()?.type == 'LPAREN') ? this.buildFunction() : this.buildVariable();
      case 'VALUE':
        return this.buildValue();
      default:
        throw new SyntaxError(this.unexpectedTokenMessage());
    }
  }

  buildVariable(): ASTVariableNode {
    const variable = this.getCurrentToken().value;
    this.eat('FUNCVAR');
    return { type: 'variable', name: variable };
  }

  // Build Value AST node value : value
  buildValue(): ASTValueNode {
    const value = this.getCurrentToken().value;
    this.eat('VALUE');
    return { type: 'value', value };
  }

  /*
   * Parse tokens into an AST
   *
   * formula : EQUAL entity EOF
   * function : FUNCVAR LPAREN (entity COMMA?)+ RPAREN
   * entity : (variable|value)
   * variable : FUNCVAR
   * value : VALUE
   */
  parse(tokens: Token[], flexible: boolean = false): ASTNode {
    /* Set global class states */
    this.tokens = tokens;
    this.index = 0;
    this.flexible = flexible;

    return this.buildFormula();
  }
}
