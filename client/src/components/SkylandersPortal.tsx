import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Toy {
  id: number;
  toyName: string;
  toyId: string;
  metadata?: string;
}

interface SkylandersPortalProps {
  toys?: Toy[];
  onAddToy?: (position: number) => void;
  onRemoveToy?: (position: number) => void;
  portalVersion?: "original" | "swap_force" | "trap_team" | "superchargers";
}

export function SkylandersPortal({
  toys = [],
  onAddToy,
  onRemoveToy,
  portalVersion = "original",
}: SkylandersPortalProps) {
  // Determine max slots based on portal version
  const maxSlots = portalVersion === "original" ? 4 : 4; // All versions support at least 4

  const getToyAtIndex = (index: number) => toys[index];

  const SlotCard = ({
    toy,
    position,
  }: {
    toy?: Toy;
    position: number;
  }) => {
    const metadata = toy?.metadata ? JSON.parse(toy.metadata) : {};

    return (
      <div className="relative">
        <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/50 overflow-hidden hover:border-primary transition-colors">
          {toy ? (
            <div className="relative w-full h-full">
              <img
                src={metadata.image || "/placeholder.png"}
                alt={toy.toyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemoveToy?.(position)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs font-medium truncate">
                  {toy.toyName}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToy?.(position)}
                className="text-muted-foreground hover:text-foreground"
              >
                + Add
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Skylanders Portal of Power</CardTitle>
        <CardDescription>
          Place up to {maxSlots} Skylanders, Magic Items, or Traps
        </CardDescription>
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {portalVersion === "original" && "Original Portal"}
            {portalVersion === "swap_force" && "SWAP Force Portal"}
            {portalVersion === "trap_team" && "Traptanium Portal"}
            {portalVersion === "superchargers" && "SuperChargers Portal"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Portal slots grid */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: maxSlots }).map((_, index) => (
              <SlotCard
                key={index}
                toy={getToyAtIndex(index)}
                position={index}
              />
            ))}
          </div>

          {/* Portal info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              {portalVersion === "original" && (
                <>
                  <strong>Original Portal:</strong> Supports up to 4 pieces including
                  combinations of Skylanders and Magic Items
                </>
              )}
              {portalVersion === "swap_force" && (
                <>
                  <strong>SWAP Force Portal:</strong> Enhanced design supporting
                  SWAP Force figures and Magic Items
                </>
              )}
              {portalVersion === "trap_team" && (
                <>
                  <strong>Traptanium Portal:</strong> Features trap slot for capturing
                  villains and built-in speaker
                </>
              )}
              {portalVersion === "superchargers" && (
                <>
                  <strong>SuperChargers Portal:</strong> Larger design with space for
                  vehicles and Skylanders
                </>
              )}
            </p>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {toys.length} / {maxSlots} slots filled
              </span>
              <div className="w-full max-w-xs bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(toys.length / maxSlots) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
