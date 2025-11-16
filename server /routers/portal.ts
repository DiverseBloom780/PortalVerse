import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getOrCreatePortalState,
  getUserToys,
  updatePortalState,
} from "../db";

export const portalRouter = router({
  /**
   * Get portal state for a specific platform
   */
  getState: protectedProcedure
    .input(
      z.enum(["lego_dimensions", "skylanders", "disney_infinity"])
    )
    .query(async ({ input: platform, ctx }) => {
      try {
        const portalState = await getOrCreatePortalState(ctx.user.id, platform);
        return portalState;
      } catch (error) {
        console.error("[Portal] Error getting state:", error);
        throw error;
      }
    }),

  /**
   * Update portal LED color
   */
  setLEDColor: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["lego_dimensions", "skylanders", "disney_infinity"]),
        color: z.string().regex(/^#[0-9A-F]{6}$/i),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const portalState = await getOrCreatePortalState(ctx.user.id, input.platform);
        if (!portalState) {
          throw new Error("Portal state not found");
        }

        const updated = await updatePortalState(portalState.id, {
          ledColor: input.color,
        });
        return updated;
      } catch (error) {
        console.error("[Portal] Error setting LED color:", error);
        throw error;
      }
    }),

  /**
   * Toggle portal power
   */
  togglePower: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["lego_dimensions", "skylanders", "disney_infinity"]),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const portalState = await getOrCreatePortalState(ctx.user.id, input.platform);
        if (!portalState) {
          throw new Error("Portal state not found");
        }

        const updated = await updatePortalState(portalState.id, {
          isActive: input.isActive ? 1 : 0,
        });
        return updated;
      } catch (error) {
        console.error("[Portal] Error toggling power:", error);
        throw error;
      }
    }),

  /**
   * Get all portals for user
   */
  getAllPortals: protectedProcedure.query(async ({ ctx }) => {
    try {
      const platforms: Array<"lego_dimensions" | "skylanders" | "disney_infinity"> = [
        "lego_dimensions",
        "skylanders",
        "disney_infinity",
      ];

      const portals = await Promise.all(
        platforms.map((platform) =>
          getOrCreatePortalState(ctx.user.id, platform)
        )
      );

      return portals.filter((p) => p !== undefined);
    } catch (error) {
      console.error("[Portal] Error getting all portals:", error);
      throw error;
    }
  }),

  /**
   * Get figures currently on portal
   */
  getFiguresOnPortal: protectedProcedure
    .input(
      z.enum(["lego_dimensions", "skylanders", "disney_infinity"])
    )
    .query(async ({ input: platform, ctx }) => {
      try {
        const toys = await getUserToys(ctx.user.id, platform);
        return toys;
      } catch (error) {
        console.error("[Portal] Error getting figures:", error);
        throw error;
      }
    }),
});
