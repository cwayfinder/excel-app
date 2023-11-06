import { createComponent } from './create-component';

describe('Create a component', () => {
  test('with static props', () => {
    const component = createComponent({
      prop1: 'foo',
      prop2: 'bar',
    });

    expect(component.props['prop1']).toEqual('foo');
    expect(component.props['prop2']).toEqual('bar');
  });

  test('with formula', () => {
    const component = createComponent({
      prop1: `=concat('foo', '-', 'bar')`,
      prop2: `=fetch('/api/username')`,
    });

    expect(component.props['prop1']).toEqual('foo-bar');

    expect(component.props['prop2']).toBeUndefined();
    Promise.resolve().then(() => {
      expect(component.props['prop2']).toEqual('async-data-from-/api/username');
    });
  });

  test('with formula returning promise', () => {
    const component = createComponent({
      prop1: `=fetch('/api/username')`,
    });

    expect(component.props['prop1']).toBeUndefined();

    Promise.resolve().then(() => {
      expect(component.props['prop1']).toEqual('async-data-from-/api/username');
    });
  });

  test('with formula returning observable', () => {
    jest.useFakeTimers();

    const component = createComponent({
      prop1: `=interval(1000)`,
      prop2: `=concat(interval(1000), '-', 'foo')`,
    });

    jest.advanceTimersByTime(3000);

    expect(component.props['prop1']).toEqual('2');
    expect(component.props['prop2']).toEqual('2-foo');
  });
});

// "concat" is a synchronous function
// "fetch" is an asynchronous function
// the result of "concat" is available immediately, but it's incorrect
// because the result of "fetch" is not available yet
test('with nested async formula', () => {
  const component = createComponent({
    prop1: `=concat(fetch('foo'), '|', fetch('bar'))`,
  });

  expect(component.props['prop1']).toEqual('|'); // not sure about this line
  Promise.resolve().then(() => {
    expect(component.props['prop1']).toEqual('async-data-from-foo|async-data-from-bar');
  });
});

test('with nested async formula2', () => {
  jest.useFakeTimers();

  const component = createComponent({
    prop1: `=concat(fetch('foo'), '|', interval(1000))`,
  });

  jest.advanceTimersByTime(3000);

  Promise.resolve().then(() => {
    expect(component.props['prop1']).toEqual('async-data-from-foo|2');
  });
});

describe('Create multiple components', () => {
  test('user form', () => {
    const firstName = createComponent({
      label: `First name`,
      value: `John`,
    });
    const lastName = createComponent({
      label: `Last name`,
      value: `Doe`,
    });
    const fullName = createComponent({
      label: `Full name`,
      value: `=concat(prop(${firstName.id}, 'value'), ' ', prop(${lastName.id}, 'value'))`,
    });

    expect(fullName.props['value']).toEqual('John Doe');

    firstName.setProp('value', 'Jane');

    expect(fullName.props['value']).toEqual('Jane Doe');

    lastName.setProp('value', 'Smith');

    expect(fullName.props['value']).toEqual('Jane Smith');
  });
});
