// Cloudflare KV service client
// Supports both direct bindings (in Workers) and API access (in other environments)

// KVNamespace 类型定义，适用于 Cloudflare Worker 环境
interface KVNamespace {
  get(
    key: string,
    options?: { type: "text" | "json" | "arrayBuffer" | "stream" }
  ): Promise<any>;
  get<T>(key: string, options: { type: "json" }): Promise<T | null>;
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer | FormData
  ): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

// KV 客户端接口定义
export interface KVClient {
  get<T = unknown>(key: string): Promise<T | null>;
  getAll<T = unknown>(): Promise<Record<string, T>>;
  has(key: string): Promise<boolean>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

// 内存缓存，用于本地开发或回退时
class MemoryKVStore implements KVClient {
  private store: Map<string, unknown> = new Map();

  async get<T = unknown>(key: string): Promise<T | null> {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  async getAll<T = unknown>(): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    this.store.forEach((value, key) => {
      result[key] = value as T;
    });
    return result;
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// 直接使用 Cloudflare KV 绑定的客户端 (在 Worker 环境中使用)
class CloudflareKVBindingClient implements KVClient {
  private namespace: KVNamespace;

  constructor(namespace: KVNamespace) {
    this.namespace = namespace;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      return await this.namespace.get<T>(key, { type: "json" });
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async getAll<T = unknown>(): Promise<Record<string, T>> {
    try {
      const result: Record<string, T> = {};
      // 使用 list 获取所有键
      const keys = await this.namespace.list();

      // 批量获取值 (可以优化为分组批量获取)
      for (const key of keys.keys) {
        const value = await this.get<T>(key.name);
        if (value !== null) {
          result[key.name] = value;
        }
      }

      return result;
    } catch (error) {
      console.error("Error getting all values:", error);
      return {};
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.namespace.get(key, { type: "text" });
      return value !== null;
    } catch (error) {
      console.error(`Error checking key existence ${key}:`, error);
      return false;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await this.namespace.put(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.namespace.delete(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }
}

// 检测是否在 Worker 环境中
const isWorkerEnvironment = (): boolean => {
  return (
    typeof self !== "undefined" &&
    typeof self.caches !== "undefined" &&
    "KVNamespace" in globalThis
  );
};

// 导出创建客户端的工厂函数
export function createKVClient(kvBinding?: KVNamespace): KVClient {
  // 如果在 Worker 环境并且提供了 KV 绑定，使用直接绑定方式
  if (isWorkerEnvironment() && kvBinding) {
    return new CloudflareKVBindingClient(kvBinding);
  }

  // 回退到内存存储
  console.warn("! 未在 Cloudflare Worker 环境中运行, 使用内存存储代替");
  return new MemoryKVStore();
}

// 导出客户端实例而不是默认导出
// 在 Worker 环境中，需要从绑定传入 KV 命名空间
// 例如: export default { fetch: (request, env) => {
//   const kv = createKVClient(env.MY_KV);
//   ...
// }}
export const kvClient = createKVClient();
