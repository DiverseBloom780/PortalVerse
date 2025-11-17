import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCharactersByPlatform,
  getCharacterById,
  getCharactersByType,
  searchCharacters,
} from "../character-database";

export const charactersRouter = router({
  /**
   * Get all characters for a platform
   */
  getByPlatform: publicProcedure
    .input(z.enum(["lego_dimensions", "skylanders", "disney_infinity"]))
    .query(({ input: platform }) => {
      return getCharactersByPlatform(platform);
    }),

  /**
   * Get character by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        platform: z.enum(["lego_dimensions", "skylanders", "disney_infinity"]),
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return getCharacterById(input.platform, input.id);
    }),

  /**
   * Get characters by type (character, vehicle, item, etc.)
   */
  getByType: publicProcedure
    .input(
      z.object({
        platform: z.enum(["lego_dimensions", "skylanders", "disney_infinity"]),
        type: z.enum(["character", "vehicle", "item", "magic_item", "power_disc"]),
      })
    )
    .query(({ input }) => {
      return getCharactersByType(input.platform, input.type);
    }),

  /**
   * Search characters by name or series
   */
  search: publicProcedure
    .input(
      z.object({
        platform: z.enum(["lego_dimensions", "skylanders", "disney_infinity"]),
        query: z.string().min(1),
      })
    )
    .query(({ input }) => {
      return searchCharacters(input.platform, input.query);
    }),
});
