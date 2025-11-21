import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  portalStates,
  virtualToys,
  toyUpgrades,
  PortalState,
  InsertVirtualToy,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.


// ============================================================================
// Toy & Portal Management Queries
// ============================================================================

/**
 * Get or create a portal state for a user and platform
 */
export async function getOrCreatePortalState(
  userId: number,
  platform: "lego_dimensions" | "skylanders" | "disney_infinity"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get portal state: database not available");
    return undefined;
  }

  try {
    // Try to find existing portal state
    const existing = await db
      .select()
      .from(portalStates)
      .where(
        and(eq(portalStates.userId, userId), eq(portalStates.platform, platform))
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new portal state
    const result = await db.insert(portalStates).values({
      userId,
      platform,
      isActive: 0,
      ledColor: "#0000FF",
    });

    // Fetch and return the created record
    const created = await db
      .select()
      .from(portalStates)
      .where(
        and(eq(portalStates.userId, userId), eq(portalStates.platform, platform))
      )
      .limit(1);

    return created[0];
  } catch (error) {
    console.error("[Database] Failed to get/create portal state:", error);
    throw error;
  }
}

/**
 * Get all virtual toys for a user and platform
 */
export async function getUserToys(
  userId: number,
  platform?: "lego_dimensions" | "skylanders" | "disney_infinity"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get toys: database not available");
    return [];
  }

  try {
    if (platform) {
      return await db
        .select()
        .from(virtualToys)
        .where(and(eq(virtualToys.userId, userId), eq(virtualToys.platform, platform)));
    } else {
      return await db
        .select()
        .from(virtualToys)
        .where(eq(virtualToys.userId, userId));
    }
  } catch (error) {
    console.error("[Database] Failed to get toys:", error);
    throw error;
  }
}

/**
 * Get a specific toy by ID
 */
export async function getToyById(toyId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get toy: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(virtualToys)
      .where(eq(virtualToys.id, toyId))
      .limit(1);
  } catch (error) {
    console.error("[Database] Failed to get toys:", error);
    throw error;
  }
}/**
 * Create a new virtual toy
 */
export async function createToy(toy: InsertVirtualToy) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create toy: database not available");
    return undefined;
  }

  try {
    await db.insert(virtualToys).values(toy);

    // Return the created toy
    const created = await db
      .select()
      .from(virtualToys)
      .where(
        and(
          eq(virtualToys.userId, toy.userId),
          eq(virtualToys.toyId, toy.toyId),
          eq(virtualToys.platform, toy.platform)
        )
      )
      .limit(1);

    return created[0];
  } catch (error) {
    console.error("[Database] Failed to create toy:", error);
    throw error;
  }
}

/**
 * Get toy upgrades
 */
export async function getToyUpgrades(toyId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get upgrades: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(toyUpgrades)
      .where(eq(toyUpgrades.toyId, toyId));
  } catch (error) {
    console.error("[Database] Failed to get upgrades:", error);
    throw error;
  }
}

/**
 * Update or create a toy upgrade
 */
export async function setToyUpgrade(
  toyId: number,
  upgradeKey: string,
  upgradeValue: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set upgrade: database not available");
    return undefined;
  }

  try {
    // Check if upgrade exists
    const existing = await db
      .select()
      .from(toyUpgrades)
      .where(
        and(eq(toyUpgrades.toyId, toyId), eq(toyUpgrades.upgradeKey, upgradeKey))
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(toyUpgrades)
        .set({ upgradeValue })
        .where(eq(toyUpgrades.id, existing[0].id));
    } else {
      // Create new
      await db.insert(toyUpgrades).values({
        toyId,
        upgradeKey,
        upgradeValue,
      });
    }

    // Return updated record
    const result = await db
      .select()
      .from(toyUpgrades)
      .where(
        and(eq(toyUpgrades.toyId, toyId), eq(toyUpgrades.upgradeKey, upgradeKey))
      )
      .limit(1);

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to set upgrade:", error);
    throw error;
  }
}

/**
 * Update portal state
 */
export async function updatePortalState(
  portalStateId: number,
  updates: Partial<PortalState>
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update portal state: database not available");
    return undefined;
  }

  try {
    await db
      .update(portalStates)
      .set(updates)
      .where(eq(portalStates.id, portalStateId));

    // Return updated record
    const result = await db
      .select()
      .from(portalStates)
      .where(eq(portalStates.id, portalStateId))
      .limit(1);

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update portal state:", error);
    throw error;
  }
}


