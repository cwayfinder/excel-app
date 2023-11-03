export function fetch(url: string): Promise<string> {
  return Promise.resolve('async-data-from-' + url);
}
