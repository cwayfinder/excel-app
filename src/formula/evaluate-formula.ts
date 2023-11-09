import { Excel } from './parser/excel';
import { ASTFunctionNode, ASTNode, ASTValueNode, ASTVariableNode } from './parser/node';
import { functions } from '../functions';
import { observable, onBecomeUnobserved, reaction, runInAction} from 'mobx';
import { isObservableValue } from '../util/is-observable-value';
import { isPromise } from '../util/is-promise';

export function evaluateFormula(formula: string): ResultObservable {
  const excel = new Excel();
  const ast = excel.parse(formula);

  return watchNode(ast);
}

type ResultObservable = { value: string, isLoading: boolean }

function watchFunctionNode(node: ASTFunctionNode): ResultObservable {
  const func = functions[node.name];
  const args = node.args.map((arg) => watchNode(arg));

  const resultObservable = observable.object<ResultObservable>({value: undefined, isLoading: false});

  const disposer = reaction(
    () => args.map((arg) => arg.value),
    handler,
    { fireImmediately: true });
  onBecomeUnobserved(resultObservable, 'value', disposer);

  function handler(values: string[]): void {
    const result = func(...values);


    if (isPromise(result)) {
      resultObservable.isLoading = true
      result
          .then((value) => runInAction(() => resultObservable.value = value))
          .finally(() => runInAction(() => resultObservable.isLoading = false))
      return;
    }

    if (isObservableValue(result)) {
      const disposer = reaction(
        () => result.get(),
        (value) => resultObservable.value = value,
        { fireImmediately: true },
      );
      onBecomeUnobserved(resultObservable, 'value', disposer);
      return;
    }

    resultObservable.value = result
  }

  return resultObservable;
}

function watchValueNode(node: ASTValueNode): ResultObservable {
  return observable.object({value: node.value, isLoading: false})
}

function watchVariableNode(node: ASTVariableNode): ResultObservable {
  throw new Error('Variable is not supported');
}

const watchers: Record<string, (node: ASTNode) => ResultObservable> = {
  function: watchFunctionNode,
  value: watchValueNode,
  variable: watchVariableNode,
};

function watchNode(node: ASTNode): ResultObservable {
  const watcher = watchers[node.type];
  if (!watcher) {
    throw new Error(`Cannot create node. Node: ${JSON.stringify(node)}`);
  }

  return watcher(node);
}
