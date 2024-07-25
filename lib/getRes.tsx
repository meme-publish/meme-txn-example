export function getRes<T>(fun: () => T) {
  return fun();
}
