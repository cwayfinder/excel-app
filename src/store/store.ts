import { makeObservable, observable } from 'mobx';
import { Component } from './component';

export class Store {
  private static instance: Store;

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  components: Record<number, Component>;

  private constructor() {
    this.components = {};

    makeObservable(this, {
      components: observable,
    });
  }
}
