import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Portal state table - tracks the current state of each emulated portal
 */
export const portalStates = mysqlTable("portal_states", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: mysqlEnum("platform", [
    "lego_dimensions",
    "skylanders",
    "disney_infinity",
  ]).notNull(),
  isActive: int("isActive").default(0).notNull(), // 0 = false, 1 = true
  ledColor: varchar("ledColor", { length: 7 }).default("#0000FF"), // RGB hex
  figuresOnPortal: text("figuresOnPortal"), // JSON array of toy IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortalState = typeof portalStates.$inferSelect;
export type InsertPortalState = typeof portalStates.$inferInsert;

/**
 * Virtual toys table - stores all emulated toys/characters/figures
 */
export const virtualToys = mysqlTable("virtual_toys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: mysqlEnum("platform", [
    "lego_dimensions",
    "skylanders",
    "disney_infinity",
  ]).notNull(),
  toyId: varchar("toyId", { length: 64 }).notNull(), // Unique identifier (NFC UID or character ID)
  toyName: varchar("toyName", { length: 255 }).notNull(),
  toyType: mysqlEnum("toyType", [
    "character",
    "vehicle",
    "item",
    "magic_item",
    "power_disc",
  ]).notNull(),
  nfcData: text("nfcData"), // Raw NFC data (32 bytes for Skylanders/Disney Infinity)
  metadata: text("metadata"), // JSON field for platform-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VirtualToy = typeof virtualToys.$inferSelect;
export type InsertVirtualToy = typeof virtualToys.$inferInsert;

/**
 * Toy upgrades table - tracks upgrades and modifications for toys
 */
export const toyUpgrades = mysqlTable("toy_upgrades", {
  id: int("id").autoincrement().primaryKey(),
  toyId: int("toyId")
    .notNull()
    .references(() => virtualToys.id, { onDelete: "cascade" }),
  upgradeKey: varchar("upgradeKey", { length: 255 }).notNull(), // Upgrade identifier
  upgradeValue: text("upgradeValue"), // Upgrade state/level (can be JSON)
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ToyUpgrade = typeof toyUpgrades.$inferSelect;
export type InsertToyUpgrade = typeof toyUpgrades.$inferInsert;

/**
 * Toy placements table - tracks when figures are placed/removed from portal
 */
export const toyPlacements = mysqlTable("toy_placements", {
  id: int("id").autoincrement().primaryKey(),
  portalStateId: int("portalStateId")
    .notNull()
    .references(() => portalStates.id, { onDelete: "cascade" }),
  toyId: int("toyId")
    .notNull()
    .references(() => virtualToys.id, { onDelete: "cascade" }),
  placedAt: timestamp("placedAt").defaultNow().notNull(),
  removedAt: timestamp("removedAt"), // null if still placed
});

export type ToyPlacement = typeof toyPlacements.$inferSelect;
export type InsertToyPlacement = typeof toyPlacements.$inferInsert;
