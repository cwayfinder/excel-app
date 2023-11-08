import { Excel } from './parser/excel';
import { ASTFunctionNode, ASTNode, ASTValueNode, ASTVariableNode } from './parser/node';
import { functions } from '../functions';
import { observable, onBecomeUnobserved, reaction, runInAction} from 'mobx';
import { isObservableValue } from '../util/is-observable-value';
import { isPromise } from '../util/is-promise';

export function evaluateFormula(formula: string): ResultObserver {
  const excel = new Excel();
  const ast = excel.parse(formula);

  return watchNode(ast);
}

type ResultObserver = { value: string, isLoading: boolean }

function watchFunctionNode(node: ASTFunctionNode): ResultObserver {
  const func = functions[node.name];
  const args = node.args.map((arg) => watchNode(arg));

  const observer = observable.object<ResultObserver>({value: undefined, isLoading: false});

  const disposer = reaction(
    () => args.map((arg) => arg.value),
    handler,
    { fireImmediately: true });
  onBecomeUnobserved(observer, 'value', disposer);

  function handler(values: string[]): void {
    const result = func(...values);


    if (isPromise(result)) {
      observer.isLoading = true
      result
          .then((value) => runInAction(() => observer.value = value))
          .finally(() => runInAction(() => observer.isLoading = false))
      return;
    }

    if (isObservableValue(result)) {
      const disposer = reaction(
        () => result.get(),
        (value) => observer.value = value,
        { fireImmediately: true },
      );
      onBecomeUnobserved(observer, 'value', disposer);
      return;
    }

    observer.value = result
  }

  return observer;
}

function watchValueNode(node: ASTValueNode): ResultObserver {
  return observable.object({value: node.value, isLoading: false})
}

function watchVariableNode(node: ASTVariableNode): ResultObserver {
  throw new Error('Variable is not supported');
}

const watchers: Record<string, (node: ASTNode) => ResultObserver> = {
  function: watchFunctionNode,
  value: watchValueNode,
  variable: watchVariableNode,
};

function watchNode(node: ASTNode): ResultObserver {
  const watcher = watchers[node.type];
  if (!watcher) {
    throw new Error(`Cannot create node. Node: ${JSON.stringify(node)}`);
  }

  return watcher(node);
}
