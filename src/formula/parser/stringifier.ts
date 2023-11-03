import { ASTFunctionNode, ASTNode, ASTValueNode, ASTVariableNode } from './node';
import * as he from 'he';

/* Base class Interpreter, this contains common methods for interpreters */
abstract class Stringifier {

  protected visitNode(node: ASTNode): string {
    switch (node.type) {
      case 'function':
        return this.visitFunctionNode(node);
      case 'variable':
        return this.visitVariableNode(node);
      case 'value':
        return this.visitValueNode(node);
      default:
        throw new Error(`Unrecognised AST node`);
    }
  }

  protected visitValueNode(node: ASTValueNode): string {
    if (Array.isArray(node.value)) {
      return `[${node.value.map(item => this.processStringValue(item)).join(', ')}]`;
    }

    if (node.value && typeof node.value === 'object') {
      return this.processObjectValue(node.value);
    }

    return this.processStringValue(node.value);
  }

  protected processObjectValue(item: object) {
    const object = Object.entries(item);
    const key_values = object.map(([key, value]) => {
      // Check for nested object values
      let result_value = '';
      if (typeof value === 'object') {
        result_value = this.processObjectValue(value);
      } else {
        result_value = this.processStringValue(value);
      }
      return `${key}: ${result_value}`;
    });
    return `{ ${key_values.join(', ')} }`;
  }

  protected processStringValue(item: any): string {

    if (typeof item === 'string') {
      const escaped_item: string = he.escape(item.toString());
      return `'${String(escaped_item)}'`;
    }

    return String(item);
  }

  protected visitArrayNodes(array: ASTNode[]): string {
    return array.map(arg => this.visitNode(arg)).join(', ');
  }

  protected abstract visitFunctionNode(node: ASTFunctionNode): string;

  protected abstract visitVariableNode(node: ASTVariableNode): string;
}

/*
 * InterpreterToFormula is responsible for build an Excel-like formula from AST
 */
export class DefaultStringifier extends Stringifier {

  protected visitFunctionNode(node: ASTFunctionNode): string {
    return `${node.name}(${this.visitArrayNodes(node.args)})`;
  }

  protected visitVariableNode(node: ASTVariableNode): string {
    return node.name;
  }

  stringify(tree: ASTNode): string {
    return this.visitNode(tree);
  }
}

/*
 * InterpreterToHtml is responsible for build an HTML Excel-like formula from AST
 */
export class HtmlStringifier extends Stringifier {

  maxParenDeep: number;
  currentDeep: number;

  constructor(maxParenDeep: number = 3) {
    super();
    this.maxParenDeep = maxParenDeep;
    this.currentDeep = 1;
  }

  protected visitFunctionNode(node: ASTFunctionNode): string {
    let result: string = '';

    const paren: string = `paren-deep-${this.currentDeep}`;
    this.incrementParenDeep();

    result += this.createHtmlSpan('function', node.name);
    result += this.createHtmlSpan(paren, '(');
    result += this.visitArrayNodes(node.args);
    result += (node.closed) ? this.createHtmlSpan(paren, ')') : ``;

    return result;
  }

  protected incrementParenDeep(): void {
    if (this.currentDeep < this.maxParenDeep) {
      this.currentDeep += 1;
    } else {
      this.currentDeep = 1;
    }
  }

  protected visitVariableNode(node: ASTVariableNode): string {
    return this.createHtmlSpan('variable', node.name);
  }

  protected override processStringValue(value: any): string {
    return this.createHtmlSpan('value', super.processStringValue(value));
  }

  private createHtmlSpan(class_attr: string, value: string): string {
    return `<span class="${class_attr}">${value}</span>`;
  }

  setMaxParenDeep(newMaxParenDeep: number): void {
    this.maxParenDeep = newMaxParenDeep;
  }

  interpret(tree: ASTNode): string {
    this.currentDeep = 1;
    return `<div>${this.visitNode(tree)}</div>`;
  }
}
