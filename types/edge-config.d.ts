declare module "@vercel/edge-config" {
  export interface EdgeConfigClient {
    get<T = unknown>(key: string): Promise<T | null>;
    getAll<T = unknown>(): Promise<Record<string, T>>;
    has(key: string): Promise<boolean>;
    digest(): Promise<string>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
  }

  export function createClient(connectionString: string): EdgeConfigClient;

  export function get<T = unknown>(key: string): Promise<T | null>;
  export function getAll<T = unknown>(): Promise<Record<string, T>>;
  export function has(key: string): Promise<boolean>;
  export function digest(): Promise<string>;
}
