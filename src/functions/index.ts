import { IObservableValue } from 'mobx';
import { concat } from './concat';
import { fetch } from './fetch';
import { ticker } from './ticker';
import { prop } from './prop';

export type Func = (...args: any[]) => string | Promise<string> | IObservableValue<string>;

export const functions: Record<string, Func> = {
  concat,
  fetch,
  ticker,
  prop,
};
