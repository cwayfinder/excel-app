import { makeObservable, observable } from 'mobx';
import { Component } from './component';

class Store {
  components: Record<number, Component>;

  constructor() {
    this.components = {};

    makeObservable(this, {
      components: observable,
    });
  }
}

export const store = new Store();
