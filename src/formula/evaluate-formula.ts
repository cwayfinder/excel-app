import { Excel } from './parser/excel';
import { ASTFunctionNode, ASTNode, ASTValueNode, ASTVariableNode } from './parser/node';
import { functions } from '../functions';
import { IObservableValue, observable, onBecomeUnobserved, reaction, runInAction } from 'mobx';
import { isObservableValue } from '../util/is-observable-value';
import { isPromise } from '../util/is-promise';

export function evaluateFormula(formula: string): IObservableValue<string> {
  const excel = new Excel();
  const ast = excel.parse(formula);

  return watchNode(ast);
}

function watchFunctionNode(node: ASTFunctionNode): IObservableValue<string> {
  const funcName = node.name.toLowerCase().replaceAll('_', '');
  const func = functions[funcName];
  const args = node.args.map((arg) => watchNode(arg));

  const observer = observable.box<string>();

  const disposer = reaction(
    () => args.map((arg) => arg.get()),
    handler,
    { fireImmediately: true });
  onBecomeUnobserved(observer, disposer);

  function handler(values: string[]) {
    const result = func(...values);

    if (isPromise(result)) {
      result.then((r) => runInAction(() => observer.set(r)));
      return;
    }

    if (isObservableValue(result)) {
      const disposer = reaction(
        () => result.get(),
        (r) => observer.set(r),
        {
          fireImmediately: true,
        },
      );
      onBecomeUnobserved(observer, disposer);
      return;
    }
    observer.set(result);
  }

  return observer;
}

function watchValueNode(node: ASTValueNode): IObservableValue<string> {
  return observable.box(node.value);
}

function watchVariableNode(node: ASTVariableNode): IObservableValue<string> {
  throw new Error('Variable is not supported');
}

const watchers: Record<string, (node: ASTNode) => IObservableValue<string>> = {
  function: watchFunctionNode,
  value: watchValueNode,
  variable: watchVariableNode,
};

function watchNode(node: ASTNode): IObservableValue<string> {
  const watcher = watchers[node.type];
  if (!watcher) {
    throw new Error(`Cannot create node. Node: ${JSON.stringify(node)}`);
  }

  return watcher(node);
}
