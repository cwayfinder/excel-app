 import { Store } from './store/store';
import { IObservableValue, observable, onBecomeObserved, onBecomeUnobserved, reaction, runInAction,  } from 'mobx';

export type Func = (...args: any[]) => string | Promise<string> | IObservableValue<string>;

function concat(...args: string[]): string {
  return args.join('');
}

function fetch(url: string): Promise<string> {
  return Promise.resolve('async-data-from-' + url);
}

function ticker(interval: number): IObservableValue<string> {
  const state = observable.box('-1');
  let id: NodeJS.Timeout | null = null;

  const start = () => {
    id = setInterval(() => {
      runInAction(() => {
        const current = parseInt(state.get());
        const next = String(current + 1);
        state.set(next);
      });
    }, interval);
  };

  const stop = () => {
      clearInterval(id);
      id = null;
  };

  onBecomeObserved(state, start);
  onBecomeUnobserved(state, stop);

  return state;
}

function prop(componentId: number, name: string): IObservableValue<string> {
  const store = Store.getInstance();
  const component = store.components[componentId];

  const propValue = observable.box(component.props[name]);

  const disposer = reaction(
    () => component.props[name],
    (newValue) => {
      propValue.set(newValue);
    },
    {
      fireImmediately: true
    }
  );
  onBecomeUnobserved(propValue, disposer);

  return propValue
}

export const functions: Record<string, Func> = {
  concat,
  fetch,
  ticker,
  prop,
};
