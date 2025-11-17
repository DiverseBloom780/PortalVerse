import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";

const PLATFORMS = [
  { id: "lego_dimensions", name: "Lego Dimensions" },
  { id: "skylanders", name: "Skylanders" },
  { id: "disney_infinity", name: "Disney Infinity" },
] as const;

export default function ToyInventory() {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<typeof PLATFORMS[number]["id"]>(
    "lego_dimensions"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showGallery, setShowGallery] = useState(false);

  const { data: toys, isLoading: toysLoading } = trpc.toys.getAll.useQuery(
    selectedPlatform
  );

  const { data: characters, isLoading: charactersLoading } =
    trpc.characters.getByPlatform.useQuery(selectedPlatform);

  const { data: searchResults } = trpc.characters.search.useQuery(
    { platform: selectedPlatform, query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const createToy = trpc.toys.create.useMutation();

  if (!user) return null;

  const displayCharacters = searchQuery ? searchResults : characters;

  const handleAddCharacter = async (character: any) => {
    if (!character) return;

    await createToy.mutateAsync({
      platform: selectedPlatform,
      toyId: character.id,
      toyName: character.name,
      toyType: character.type,
      metadata: JSON.stringify({
        series: character.series,
        description: character.description,
        image: character.image,
      }),
    });

    setShowGallery(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Toy Inventory</h1>
          <p className="text-muted-foreground">
            Manage your virtual toys and characters
          </p>
        </div>

        {/* Platform Selector */}
        <div className="flex gap-2 mb-6">
          {PLATFORMS.map((platform) => (
            <Button
              key={platform.id}
              variant={selectedPlatform === platform.id ? "default" : "outline"}
              onClick={() => setSelectedPlatform(platform.id)}
            >
              {platform.name}
            </Button>
          ))}
        </div>

        {/* Gallery Toggle */}
        <Button
          onClick={() => setShowGallery(!showGallery)}
          className="mb-6"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showGallery ? "Hide Gallery" : "Add Character"}
        </Button>

        {/* Character Gallery */}
        {showGallery && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Character</CardTitle>
              <CardDescription>
                Choose a character, vehicle, or item to add to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Character Grid */}
              {charactersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayCharacters?.map((character) => (
                    <div
                      key={character.id}
                      className="group cursor-pointer"
                      onClick={() => handleAddCharacter(character)}
                    >
                      <div className="relative mb-2 overflow-hidden rounded-lg bg-muted aspect-square">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddCharacter(character);
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <p className="font-medium text-sm truncate">{character.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {character.type}
                      </Badge>
                      {character.series && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {character.series}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Toy List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Toys</CardTitle>
            <CardDescription>
              {toys?.length || 0} toy(s) in your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {toysLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : toys && toys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {toys.map((toy) => {
                  const metadata = toy.metadata
                    ? JSON.parse(toy.metadata)
                    : {};

                  return (
                    <Card key={toy.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img
                          src={metadata.image || "/placeholder.png"}
                          alt={toy.toyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-bold mb-2">{toy.toyName}</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <Badge variant="outline">{toy.toyType}</Badge>
                          </div>
                          {metadata.series && (
                            <p className="text-muted-foreground">
                              {metadata.series}
                            </p>
                          )}
                          <div className="flex gap-2 pt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No toys in your inventory yet
                </p>
                <Button onClick={() => setShowGallery(true)}>
                  Add Your First Toy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
