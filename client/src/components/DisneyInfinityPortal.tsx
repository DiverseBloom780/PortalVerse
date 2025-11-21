import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Toy {
  id: number;
  toyName: string;
  toyId: string;
  metadata?: string;
}

interface DisneyInfinityPortalProps {
  toys?: Toy[];
  onAddToy?: (position: number) => void;
  onRemoveToy?: (position: number) => void;
}

export function DisneyInfinityPortal({
  toys = [],
  onAddToy,
  onRemoveToy,
}: DisneyInfinityPortalProps) {
  const getToyAtIndex = (index: number) => toys[index];

  const SlotCard = ({
    toy,
    position,
    label,
  }: {
    toy?: Toy;
    position: number;
    label: string;
  }) => {
    const metadata = toy?.metadata ? JSON.parse(toy.metadata) : {};

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 overflow-hidden hover:border-primary transition-colors flex items-center justify-center">
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
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToy?.(position)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                + Add
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs font-medium mt-2 text-muted-foreground">{label}</p>
        {toy && (
          <p className="text-xs text-center mt-1 max-w-[100px] truncate">
            {toy.toyName}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Disney Infinity Base</CardTitle>
        <CardDescription>
          Place up to 3 figures in a triangle formation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-8">
          {/* Top slot */}
          <SlotCard
            toy={getToyAtIndex(0)}
            position={0}
            label="Top"
          />

          {/* Bottom two slots */}
          <div className="flex gap-16 justify-center">
            <SlotCard
              toy={getToyAtIndex(1)}
              position={1}
              label="Bottom Left"
            />
            <SlotCard
              toy={getToyAtIndex(2)}
              position={2}
              label="Bottom Right"
            />
          </div>

          {/* Summary */}
          <div className="w-full pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {toys.length} / 3 slots filled
              </span>
              <div className="w-full max-w-xs bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(toys.length / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
