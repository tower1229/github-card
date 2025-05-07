import { drizzle } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/d1/migrator';
import * as schema from './schema';
import type { D1Database } from '@cloudflare/workers-types';

// 该脚本用于在 Cloudflare D1 中创建数据库表结构
export async function runMigration(db: D1Database) {
  const client = drizzle(db, { schema });
  
  console.log('开始迁移到 D1 数据库...');
  try {
    // 使用 drizzle 的内置迁移器执行迁移
    await migrate(client, { migrationsFolder: 'drizzle/migrations' });
    console.log('D1 数据库迁移完成！');
  } catch (error) {
    console.error('迁移过程中出现错误:', error);
    throw error;
  }
}

// 如果从命令行直接执行此脚本
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  console.log('⚠️ 请在 Cloudflare Pages Functions 环境中运行此脚本');
  console.log('您可以通过 Cloudflare Pages Dashboard 中的 Functions 选项卡运行迁移');
}
