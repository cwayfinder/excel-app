import { IObservableValue, isObservable } from 'mobx';

export function isObservableValue(value: any): value is IObservableValue<string> {
  return isObservable(value);
}
