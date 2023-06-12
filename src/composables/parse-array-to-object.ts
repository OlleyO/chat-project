export function parseArrayToObject<T extends object> (array: T[], key: keyof T) {
  return array.reduce((prev, curr) => ({
    ...prev,
    [curr[key]]: { ...curr }
  }), {} as {
    [key: string]: T
  })
}
