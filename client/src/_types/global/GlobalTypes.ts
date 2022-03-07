export {};

declare global {
  interface Window {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    snarkjs: any;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    gm: any;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    pm: any;
  }
}
