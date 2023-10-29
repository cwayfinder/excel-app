import { action, makeObservable, observable } from 'mobx';

export class Component {
  id: number;
  props: Record<string, string>;

  constructor(id: number) {
    this.id = id;
    this.props = {};

    makeObservable(this, {
      id: false,
      props: observable,
      setProp: action,
    });
  }

  setProp(name: string, value: string) {
    this.props[name] = value;
  }
}
