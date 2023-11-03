import { Excel } from './formula-parser/excel';
import { ASTNode } from './formula-parser/node';
import { Func, functions } from './functions';
import { IObservableValue, observable, onBecomeUnobserved, reaction, runInAction } from 'mobx';
import { isObservableValue } from './util/is-observable-value';
import { isPromise } from './util/is-promise';

export function evaluateFormula(formula: string): IObservableValue<string> {
  const excel = new Excel();
  const ast = excel.parse(formula);

  return watchNode(ast);
}

function watchNode(node: ASTNode): IObservableValue<string> {
  if (node.type === 'function') {
    const funcName = node.name.toLowerCase().replaceAll('_', '');
    const func = functions[funcName];
    const args = node.args.map((arg) => watchNode(arg));

    return watchFunc(args, func);
  }

  if (node.type === 'value') {
    return observable.box(node.value);
  }

  if (node.type === 'variable') {
    throw new Error('Variable is not supported');
  }

  throw new Error(`Cannot create node. Node: ${JSON.stringify(node)}`);
}

function watchFunc(
  args: IObservableValue<string>[],
  fn: Func,
): IObservableValue<string> {
  const observer = observable.box<string>();

  const disposer = reaction(() => args.map((arg) => arg.get()), handler, {
    fireImmediately: true,
  });
  onBecomeUnobserved(observer, disposer);

  function handler(values: string[]) {
    const result = fn(...values);

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
