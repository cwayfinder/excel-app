import { IObservableValue, observable, onBecomeUnobserved, reaction } from 'mobx';
import { store } from '../store/store';

export function prop(componentId: number, name: string): IObservableValue<string> {
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
