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

interface LegoDimensionsPortalProps {
  toys?: Toy[];
  onAddToy?: (position: "left" | "center" | "right", index: number) => void;
  onRemoveToy?: (position: "left" | "center" | "right", index: number) => void;
}

export function LegoDimensionsPortal({
  toys = [],
  onAddToy,
  onRemoveToy,
}: LegoDimensionsPortalProps) {
  // Organize toys into sections (left, center, right)
  const leftSlots = [0, 1, 2];
  const centerSlot = [3];
  const rightSlots = [4, 5, 6];

  const getToyAtIndex = (index: number) => toys[index];

  const SlotCard = ({
    toy,
    position,
    index,
  }: {
    toy?: Toy;
    position: "left" | "center" | "right";
    index: number;
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
                  onClick={() => onRemoveToy?.(position, index)}
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
                onClick={() => onAddToy?.(position, index)}
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
        <CardTitle>Lego Dimensions Portal</CardTitle>
        <CardDescription>
          Place up to 7 figures/vehicles (3 left, 1 center, 3 right)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Left Section - 3 slots */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
              LEFT SECTION
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {leftSlots.map((index) => (
                <SlotCard
                  key={`left-${index}`}
                  toy={getToyAtIndex(index)}
                  position="left"
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Center Section - 1 slot */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
              CENTER SECTION
            </h3>
            <div className="max-w-xs">
              <SlotCard
                toy={getToyAtIndex(centerSlot[0])}
                position="center"
                index={centerSlot[0]}
              />
            </div>
          </div>

          {/* Right Section - 3 slots */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
              RIGHT SECTION
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {rightSlots.map((index) => (
                <SlotCard
                  key={`right-${index}`}
                  toy={getToyAtIndex(index)}
                  position="right"
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {toys.length} / 7 slots filled
              </span>
              <div className="w-full max-w-xs bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(toys.length / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
