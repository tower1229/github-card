// 测试Cloudflare KV连接脚本
import * as dotenv from "dotenv";
import { kvClient as kv } from "../lib/cloudflare/kv-service";

// 加载环境变量
dotenv.config({ path: ".env.local" });

async function testKVConnection() {
  console.log("测试Cloudflare KV连接...");

  try {
    // 检查环境变量
    if (!process.env.CLOUDFLARE_KV_NAMESPACE) {
      console.error("错误: 缺少CLOUDFLARE_KV_NAMESPACE环境变量");
      process.exit(1);
    }

    if (!process.env.CLOUDFLARE_API_TOKEN) {
      console.error("错误: 缺少CLOUDFLARE_API_TOKEN环境变量");
      process.exit(1);
    }

    if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
      console.error("错误: 缺少CLOUDFLARE_ACCOUNT_ID环境变量");
      process.exit(1);
    }

    console.log("环境变量已配置...");

    // 测试设置值
    const testKey = "cloudflare-kv-test";
    const testValue = {
      message: "Hello Cloudflare KV!",
      timestamp: Date.now(),
    };

    console.log(`设置测试键值: ${testKey}`);
    await kv.set(testKey, testValue);
    console.log("KV设置成功!");

    // 测试读取值
    console.log(`读取测试键值: ${testKey}`);
    const retrievedValue = await kv.get(testKey);
    console.log("读取的值:", retrievedValue);

    if (JSON.stringify(retrievedValue) === JSON.stringify(testValue)) {
      console.log("KV读取测试通过!");
    } else {
      console.error("KV读取测试失败: 值不匹配");
      process.exit(1);
    }

    // 测试列出所有键
    console.log("获取所有KV键值...");
    const allValues = await kv.getAll();
    console.log(`找到 ${Object.keys(allValues).length} 个键值对`);

    // 测试删除
    console.log(`删除测试键值: ${testKey}`);
    await kv.delete(testKey);
    console.log("KV删除成功!");

    // 验证删除
    const deletedValue = await kv.get(testKey);
    if (deletedValue === null) {
      console.log("KV删除验证通过!");
    } else {
      console.error("KV删除测试失败: 键仍然存在");
      process.exit(1);
    }

    console.log("所有KV测试通过! Cloudflare KV设置正常工作。");
  } catch (error) {
    console.error("KV测试失败:", error);
    process.exit(1);
  }
}

// 运行测试
testKVConnection();
