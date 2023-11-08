const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetch(url: string): Promise<string> {
  await delay(300)
  return 'async-data-from-' + url
}

