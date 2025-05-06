// Cloudflare KV service client
// This replaces @vercel/edge-config functionality

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
  private store: Map<string, any> = new Map();

  async get<T = unknown>(key: string): Promise<T | null> {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async getAll<T = unknown>(): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    this.store.forEach((value, key) => {
      result[key] = value;
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

// Cloudflare KV 客户端
export class CloudflareKVClient implements KVClient {
  private namespace: string;
  private apiToken: string;
  private accountId: string;
  private baseUrl: string;

  constructor(namespace: string, apiToken: string, accountId: string) {
    this.namespace = namespace;
    this.apiToken = apiToken;
    this.accountId = accountId;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespace}`;
  }

  private async fetchWithAuth(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const response = await this.fetchWithAuth(
        `/values/${encodeURIComponent(key)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get value: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async getAll<T = unknown>(): Promise<Record<string, T>> {
    try {
      // 获取所有键
      const keysResponse = await this.fetchWithAuth(`/keys`);

      if (!keysResponse.ok) {
        throw new Error(`Failed to get keys: ${keysResponse.statusText}`);
      }

      const keysData = await keysResponse.json();
      const keys = keysData.result.map((item: any) => item.name);

      // 获取所有值
      const result: Record<string, T> = {};
      for (const key of keys) {
        const value = await this.get<T>(key);
        if (value !== null) {
          result[key] = value;
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
      const response = await this.fetchWithAuth(
        `/values/${encodeURIComponent(key)}`
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Error checking key existence ${key}:`, error);
      return false;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const response = await this.fetchWithAuth(
        `/values/${encodeURIComponent(key)}`,
        {
          method: "PUT",
          body: JSON.stringify(value),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to set value: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const response = await this.fetchWithAuth(
        `/values/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete value: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }
}

// 导出创建客户端的工厂函数
export function createKVClient(): KVClient {
  if (
    process.env.CLOUDFLARE_KV_NAMESPACE &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_ACCOUNT_ID
  ) {
    // 使用Cloudflare KV
    return new CloudflareKVClient(
      process.env.CLOUDFLARE_KV_NAMESPACE,
      process.env.CLOUDFLARE_API_TOKEN,
      process.env.CLOUDFLARE_ACCOUNT_ID
    );
  } else {
    // 回退到内存存储
    console.warn(
      "Cloudflare KV credentials not found, using memory store instead"
    );
    return new MemoryKVStore();
  }
}

// 默认导出一个单例
export default createKVClient();
