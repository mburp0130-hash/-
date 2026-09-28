export {};
declare global {
  interface Window {
    __ONE_CHANGE_EVENTS__?: { name: string; ts: string; props: Record<string, unknown> }[];
  }
}
