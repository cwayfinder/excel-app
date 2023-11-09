import { Component } from './store/component';
import { evaluateFormula } from './formula/evaluate-formula';
import { store } from './store/store';
import { autorun, reaction } from 'mobx';

let counter = 0;

export function createComponent(schema: Record<string, string>) {
  const id = ++counter;
  const component = new Component(id);
  store.components[id] = component;


  for (const [propName, propSchema] of Object.entries(schema)) {
    if (propSchema.startsWith('=')) {
      const formula = propSchema.slice(1);
      const result = evaluateFormula(formula);

      autorun(() => {
        component.setProp(propName, result.value);
        component.setIsPropLoading(propName, result.isLoading)
      })
    } else {
      component.setProp(propName, propSchema);
      component.setIsPropLoading(propName, false)
    }
  }

  return component;
}
