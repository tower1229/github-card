// 定义Cloudflare KV客户端接口
export interface CloudflareKVClient {
  get<T = unknown>(key: string): Promise<T | null>;
  getAll<T = unknown>(): Promise<Record<string, T>>;
  has(key: string): Promise<boolean>;
  digest?(): Promise<string>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

// 简化的KV值类型
export interface KVStoredValue<T> {
  value: T;
  expiry: number; // 过期时间戳
}

// 声明模块以防止类型错误
declare module "../lib/cloudflare/kv-service" {
  const createKVClient: () => CloudflareKVClient;
  export { CloudflareKVClient, KVStoredValue };
  export default createKVClient();
}
