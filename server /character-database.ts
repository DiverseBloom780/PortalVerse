/**
 * Character Database
 * Contains metadata for all characters, vehicles, and objects across all platforms
 * Images are referenced as URLs that can be loaded from public assets or external sources
 */

export interface Character {
  id: string;
  name: string;
  type: "character" | "vehicle" | "item" | "magic_item" | "power_disc";
  image: string;
  platform: "lego_dimensions" | "skylanders" | "disney_infinity";
  description?: string;
  series?: string;
  nfcData?: string;
}

// Lego Dimensions Characters
export const LEGO_DIMENSIONS_CHARACTERS: Character[] = [
  {
    id: "0x0001",
    name: "Wyldstyle",
    type: "character",
    platform: "lego_dimensions",
    image: "/characters/lego/wyldstyle.png",
    series: "The Lego Movie",
  },
  {
    id: "0x0002",
    name: "Batman",
    type: "character",
    platform: "lego_dimensions",
    image: "/characters/lego/batman.png",
    series: "DC Comics",
  },
  {
    id: "0x0003",
    name: "Gandalf",
    type: "character",
    platform: "lego_dimensions",
    image: "/characters/lego/gandalf.png",
    series: "The Lord of the Rings",
  },
  {
    id: "0x0004",
    name: "Unikitty",
    type: "character",
    platform: "lego_dimensions",
    image: "/characters/lego/unikitty.png",
    series: "The Lego Movie",
  },
  {
    id: "0x0005",
    name: "Emmet",
    type: "character",
    platform: "lego_dimensions",
    image: "/characters/lego/emmet.png",
    series: "The Lego Movie",
  },
  {
    id: "0x0101",
    name: "Batmobile",
    type: "vehicle",
    platform: "lego_dimensions",
    image: "/characters/lego/batmobile.png",
    series: "DC Comics",
  },
  {
    id: "0x0102",
    name: "Delorean",
    type: "vehicle",
    platform: "lego_dimensions",
    image: "/characters/lego/delorean.png",
    series: "Back to the Future",
  },
];

// Skylanders Characters
export const SKYLANDERS_CHARACTERS: Character[] = [
  {
    id: "0x0001",
    name: "Spyro",
    type: "character",
    platform: "skylanders",
    image: "/characters/skylanders/spyro.png",
    series: "Skylanders",
  },
  {
    id: "0x0002",
    name: "Trigger Happy",
    type: "character",
    platform: "skylanders",
    image: "/characters/skylanders/trigger-happy.png",
    series: "Skylanders",
  },
  {
    id: "0x0003",
    name: "Stealth Elf",
    type: "character",
    platform: "skylanders",
    image: "/characters/skylanders/stealth-elf.png",
    series: "Skylanders",
  },
  {
    id: "0x0004",
    name: "Bash",
    type: "character",
    platform: "skylanders",
    image: "/characters/skylanders/bash.png",
    series: "Skylanders",
  },
  {
    id: "0x0005",
    name: "Prism Break",
    type: "character",
    platform: "skylanders",
    image: "/characters/skylanders/prism-break.png",
    series: "Skylanders",
  },
  {
    id: "0x0101",
    name: "Skylanders Sword",
    type: "item",
    platform: "skylanders",
    image: "/characters/skylanders/sword.png",
    series: "Skylanders",
  },
  {
    id: "0x0102",
    name: "Skylanders Shield",
    type: "item",
    platform: "skylanders",
    image: "/characters/skylanders/shield.png",
    series: "Skylanders",
  },
];

// Disney Infinity Characters
export const DISNEY_INFINITY_CHARACTERS: Character[] = [
  {
    id: "0x0001",
    name: "Mickey Mouse",
    type: "character",
    platform: "disney_infinity",
    image: "/characters/disney/mickey.png",
    series: "Disney",
  },
  {
    id: "0x0002",
    name: "Minnie Mouse",
    type: "character",
    platform: "disney_infinity",
    image: "/characters/disney/minnie.png",
    series: "Disney",
  },
  {
    id: "0x0003",
    name: "Buzz Lightyear",
    type: "character",
    platform: "disney_infinity",
    image: "/characters/disney/buzz.png",
    series: "Toy Story",
  },
  {
    id: "0x0004",
    name: "Woody",
    type: "character",
    platform: "disney_infinity",
    image: "/characters/disney/woody.png",
    series: "Toy Story",
  },
  {
    id: "0x0005",
    name: "Jack Sparrow",
    type: "character",
    platform: "disney_infinity",
    image: "/characters/disney/jack-sparrow.png",
    series: "Pirates of the Caribbean",
  },
  {
    id: "0x0101",
    name: "Power Disc: Sorcerer's Ring",
    type: "power_disc",
    platform: "disney_infinity",
    image: "/characters/disney/power-disc-1.png",
    series: "Disney Infinity",
  },
  {
    id: "0x0102",
    name: "Power Disc: Pixar Toy Box",
    type: "power_disc",
    platform: "disney_infinity",
    image: "/characters/disney/power-disc-2.png",
    series: "Disney Infinity",
  },
];

/**
 * Get all characters for a platform
 */
export function getCharactersByPlatform(
  platform: "lego_dimensions" | "skylanders" | "disney_infinity"
): Character[] {
  switch (platform) {
    case "lego_dimensions":
      return LEGO_DIMENSIONS_CHARACTERS;
    case "skylanders":
      return SKYLANDERS_CHARACTERS;
    case "disney_infinity":
      return DISNEY_INFINITY_CHARACTERS;
    default:
      return [];
  }
}

/**
 * Get character by ID and platform
 */
export function getCharacterById(
  platform: "lego_dimensions" | "skylanders" | "disney_infinity",
  id: string
): Character | undefined {
  const characters = getCharactersByPlatform(platform);
  return characters.find((c) => c.id === id);
}

/**
 * Get characters by type
 */
export function getCharactersByType(
  platform: "lego_dimensions" | "skylanders" | "disney_infinity",
  type: "character" | "vehicle" | "item" | "magic_item" | "power_disc"
): Character[] {
  const characters = getCharactersByPlatform(platform);
  return characters.filter((c) => c.type === type);
}

/**
 * Search characters by name
 */
export function searchCharacters(
  platform: "lego_dimensions" | "skylanders" | "disney_infinity",
  query: string
): Character[] {
  const characters = getCharactersByPlatform(platform);
  const lowerQuery = query.toLowerCase();
  return characters.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.series?.toLowerCase().includes(lowerQuery)
  );
}
