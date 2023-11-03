import { IObservableValue } from 'mobx';
import { concat } from './concat';
import { fetch } from './fetch';
import { interval } from './interval';
import { prop } from './prop';

export type Func = (...args: any[]) => string | Promise<string> | IObservableValue<string>;

export const functions: Record<string, Func> = {
  concat,
  fetch,
  interval,
  prop,
};
