import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  blob,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

// 严格按照NextAuth需要的表结构定义
export const users = sqliteTable("user", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email"),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  // 以下是自定义字段
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

// NextAuth 账户表
export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type")
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const userRelations = relations(users, ({ many }) => ({
  behaviors: many(userBehaviors),
  shareLinks: many(shareLinks),
  accounts: many(accounts),
  contributeData: many(contributeData),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// 添加GitHub贡献数据表
export const contributeData = sqliteTable("contribute_data", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  githubData: blob("github_data", { mode: "json" }).notNull(),
  lastUpdated: integer("last_updated").notNull().default(sql`(unixepoch())`),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});

export const contributeDataRelations = relations(contributeData, ({ one }) => ({
  user: one(users, {
    fields: [contributeData.username],
    references: [users.username],
  }),
}));

export const userBehaviors = sqliteTable("user_behaviors", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  actionType: text("action_type").notNull(),
  actionData: blob("action_data", { mode: "json" }),
  performedAt: integer("performed_at").notNull().default(sql`(unixepoch())`),
});

export const userBehaviorRelations = relations(userBehaviors, ({ one }) => ({
  user: one(users, {
    fields: [userBehaviors.userId],
    references: [users.id],
  }),
}));

export const shareLinks = sqliteTable("share_links", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  linkToken: text("link_token").notNull().unique(),
  githubUsername: text("github_username").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  expiresAt: integer("expires_at").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  templateType: text("template_type").notNull().default("contribute"),
});

export const shareLinkRelations = relations(shareLinks, ({ one }) => ({
  user: one(users, {
    fields: [shareLinks.userId],
    references: [users.id],
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserBehavior = typeof userBehaviors.$inferSelect;
export type NewUserBehavior = typeof userBehaviors.$inferInsert;

export type ShareLink = typeof shareLinks.$inferSelect;
export type NewShareLink = typeof shareLinks.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type ContributeData = typeof contributeData.$inferSelect;
export type NewContributeData = typeof contributeData.$inferInsert;
