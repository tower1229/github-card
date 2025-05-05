import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  json,
  boolean,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

// 严格按照NextAuth需要的表结构定义
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
  // 以下是自定义字段
  githubId: varchar("github_id", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NextAuth 账户表
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
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
export const contributeData = pgTable("contribute_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  githubData: json("github_data").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contributeDataRelations = relations(contributeData, ({ one }) => ({
  user: one(users, {
    fields: [contributeData.username],
    references: [users.username],
  }),
}));

export const userBehaviors = pgTable("user_behaviors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id),
  actionType: varchar("action_type", { length: 255 }).notNull(),
  actionData: json("action_data"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
});

export const userBehaviorRelations = relations(userBehaviors, ({ one }) => ({
  user: one(users, {
    fields: [userBehaviors.userId],
    references: [users.id],
  }),
}));

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id),
  linkToken: varchar("link_token", { length: 255 }).notNull().unique(),
  githubUsername: varchar("github_username", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  templateType: varchar("template_type", { length: 50 })
    .default("contribute")
    .notNull(),
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
