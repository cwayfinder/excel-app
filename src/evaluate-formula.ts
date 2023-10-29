import { Excel } from './formula-parser/excel';
import { combineLatest, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { ASTNode } from './formula-parser/node';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { functions } from './functions';

export function evaluateFormula(formula: string): Observable<string> {
  const excel = new Excel();
  const ast = excel.parse(formula);
  return watchNode(ast) as Observable<string>;
}

function watchNode(node: ASTNode): Observable<unknown> {
  if (node.type === 'function') {
    const funcName = node.name.toLowerCase().replaceAll('_', '');
    const func = functions[funcName];

    return watchNodes(node.args).pipe(
      switchMap((args) => {
        console.log(args);
        const result = func(...args);

        if (result instanceof Observable) {
          return result;
        }
        if (result instanceof Promise) {
          return fromPromise(result);
        }

        return of(result);
      }),
    );
  } else if (node.type === 'value') {
    return of(node.value);
  } else if (node.type === 'variable') {
    throw new Error('Variable is not supported');
  }

  throw new Error(`Cannot create node. Node: ${JSON.stringify(node)}`);
}

function watchNodes(nodes: ASTNode[]): Observable<unknown[]> {
  const observables = nodes.map((node) => watchNode(node).pipe(distinctUntilChanged()));
  return observables.length === 0 ? of([]) : combineLatest(observables);
}
