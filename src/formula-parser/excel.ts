import { ASTNode } from './node';
import { DefaultStringifier, HtmlStringifier } from './stringifier';
import { Lexer } from './lexer';
import { Parser } from './parser';

export class Excel {
  lexer: Lexer;
  parser: Parser;
  defaultStringifier: DefaultStringifier;
  htmlStringifier: HtmlStringifier;

  constructor() {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.defaultStringifier = new DefaultStringifier();
    this.htmlStringifier = new HtmlStringifier();
  }

  parse(string: string): ASTNode {
    const tokenized = this.lexer.tokenize(string);
    return this.parser.parse(tokenized);
  }

  stringify(tree: ASTNode): string {
    return this.defaultStringifier.stringify(tree);
  }

  toHtml(string: string, flexible: boolean = false, maxParenDeep: number = 3): string {
    const tokenized = this.lexer.tokenize(string, flexible);
    const ASTNode = this.parser.parse(tokenized, flexible);
    this.htmlStringifier.setMaxParenDeep(maxParenDeep);
    return this.htmlStringifier.interpret(ASTNode);
  }
}
