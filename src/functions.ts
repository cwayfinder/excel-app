import { interval, map, Observable } from 'rxjs';
import { Store } from './store/store';
import { autorun } from 'mobx';

export type Func = (...args: any[]) => string | Promise<string> | Observable<string>;

function concat(...args: string[]): string {
  return args.join('');
}

function fetch(url: string): Promise<string> {
  return Promise.resolve('async-data-from-' + url);
}

function ticker(ms: number): Observable<string> {
  return interval(ms).pipe(
    map((count) => String(count)),
  );
}

function prop(componentId: number, name: string): Observable<string> {
  const store = Store.getInstance();
  const component = store.components[componentId];

  return new Observable<string>((subscriber) => {
    const disposer = autorun(() => {
      const propValue = component.props[name];
      subscriber.next(propValue);
    });

    return () => {
      disposer();
    }
  });
}

export const functions: Record<string, Func> = {
  concat,
  fetch,
  ticker,
  prop,
};
