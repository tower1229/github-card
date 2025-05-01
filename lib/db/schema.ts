import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubId: varchar("github_id", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  behaviors: many(userBehaviors),
  shareLinks: many(shareLinks),
}));

export const userBehaviors = pgTable("user_behaviors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
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
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  linkToken: varchar("link_token", { length: 255 }).notNull().unique(),
  cardData: json("card_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
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
