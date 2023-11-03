export function isPromise(value: any): value is Promise<string> {
  return value instanceof Promise;
}
