interface ASTNodeBase {
  type: string;
}

export interface ASTFunctionNode extends ASTNodeBase {
  type: 'function';
  name: string;
  args: ASTNode[];
  closed: boolean;
}

export interface ASTVariableNode extends ASTNodeBase {
  type: 'variable';
  name: string;
}

export interface ASTValueNode extends ASTNodeBase {
  type: 'value';
  value: any;
}

export type ASTNode = ASTFunctionNode | ASTVariableNode | ASTValueNode;
