export interface IDisposable {
  dispose(): void;
}

export function toDisposable(dispose: () => void): IDisposable {
  return { dispose };
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
