import { IObservableValue, observable, onBecomeObserved, onBecomeUnobserved, runInAction } from 'mobx';

export function interval(ms: number): IObservableValue<string> {
  const state = observable.box('-1');
  let id: NodeJS.Timeout | null = null;

  const start = () => {
    id = setInterval(() => {
      runInAction(() => {
        const current = parseInt(state.get());
        const next = String(current + 1);
        state.set(next);
      });
    }, ms);
  };

  const stop = () => {
    clearInterval(id);
    id = null;
  };

  onBecomeObserved(state, start);
  onBecomeUnobserved(state, stop);

  return state;
}
