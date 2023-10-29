import { Component } from './store/component';
import { evaluateFormula } from './evaluate-formula';
import { Store } from './store/store';

let counter = 0;

export function createComponent(schema: Record<string, string>) {
  const id = ++counter;
  const component = new Component(id);
  Store.getInstance().components[id] = component;

  for (const [propName, propSchema] of Object.entries(schema)) {
    if (propSchema.startsWith('=')) {
      const formula = propSchema.slice(1);
      const observable = evaluateFormula(formula);

      observable.subscribe((value) => {
        component.setProp(propName, value);
      });
    } else {
      component.setProp(propName, propSchema);
    }
  }

  return component;
}