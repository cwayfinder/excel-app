import { action, makeObservable, observable } from 'mobx';

export class Component {
  id: number;
  props: Record<string, string>;
  propsLoading: Record<string, boolean>

  constructor(id: number) {
    this.id = id;
    this.props = {};
    this.propsLoading = {};

    makeObservable(this, {
      id: false,
      props: observable,
      propsLoading: observable,
      setProp: action,
      setIsPropLoading: action
    });
  }

  setProp(name: string, value: string) {
    this.props[name] = value;
  }

  setIsPropLoading(name: string, value: boolean) {
    this.propsLoading[name] = value
  }
}
