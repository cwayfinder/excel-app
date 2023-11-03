import { Component } from './store/component';
import { evaluateFormula } from './formula/evaluate-formula';
import { store } from './store/store';
import { autorun } from 'mobx';

let counter = 0;

export function createComponent(schema: Record<string, string>) {
  const id = ++counter;
  const component = new Component(id);
  store.components[id] = component;

  for (const [propName, propSchema] of Object.entries(schema)) {
    if (propSchema.startsWith('=')) {
      const formula = propSchema.slice(1);
      const observable = evaluateFormula(formula);

      autorun(() => {  
        component.setProp(propName, observable.get());
      })
    } else {
      component.setProp(propName, propSchema);
    }
  }

  return component;
}
