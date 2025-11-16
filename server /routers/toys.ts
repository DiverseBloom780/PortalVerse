import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserToys,
  getToyById,
  createToy,
  getToyUpgrades,
  setToyUpgrade,
} from "../db";

export const toysRouter = router({
  /**
   * Get all toys for user
   */
  getAll: protectedProcedure
    .input(
      z
        .enum(["lego_dimensions", "skylanders", "disney_infinity"])
        .optional()
    )
    .query(async ({ input: platform, ctx }) => {
      try {
        return await getUserToys(ctx.user.id, platform);
      } catch (error) {
        console.error("[Toys] Error getting toys:", error);
        throw error;
      }
    }),

  /**
   * Get specific toy by ID
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: toyId, ctx }) => {
      try {
        const toy = await getToyById(toyId);
        if (!toy || toy.userId !== ctx.user.id) {
          throw new Error("Toy not found");
        }
        return toy;
      } catch (error) {
        console.error("[Toys] Error getting toy:", error);
        throw error;
      }
    }),

  /**
   * Create new toy
   */
  create: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["lego_dimensions", "skylanders", "disney_infinity"]),
        toyId: z.string(),
        toyName: z.string(),
        toyType: z.enum(["character", "vehicle", "item", "magic_item", "power_disc"]),
        nfcData: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const toy = await createToy({
          userId: ctx.user.id,
          platform: input.platform,
          toyId: input.toyId,
          toyName: input.toyName,
          toyType: input.toyType,
          nfcData: input.nfcData,
          metadata: input.metadata,
        });
        return toy;
      } catch (error) {
        console.error("[Toys] Error creating toy:", error);
        throw error;
      }
    }),

  /**
   * Get toy upgrades
   */
  getUpgrades: protectedProcedure
    .input(z.number())
    .query(async ({ input: toyId, ctx }) => {
      try {
        const toy = await getToyById(toyId);
        if (!toy || toy.userId !== ctx.user.id) {
          throw new Error("Toy not found");
        }
        return await getToyUpgrades(toyId);
      } catch (error) {
        console.error("[Toys] Error getting upgrades:", error);
        throw error;
      }
    }),

  /**
   * Set toy upgrade
   */
  setUpgrade: protectedProcedure
    .input(
      z.object({
        toyId: z.number(),
        upgradeKey: z.string(),
        upgradeValue: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const toy = await getToyById(input.toyId);
        if (!toy || toy.userId !== ctx.user.id) {
          throw new Error("Toy not found");
        }
        return await setToyUpgrade(
          input.toyId,
          input.upgradeKey,
          input.upgradeValue
        );
      } catch (error) {
        console.error("[Toys] Error setting upgrade:", error);
        throw error;
      }
    }),
});
