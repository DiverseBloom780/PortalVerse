import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Power, Palette } from "lucide-react";

const PLATFORMS = [
  { id: "lego_dimensions", name: "Lego Dimensions", color: "#FF6B00" },
  { id: "skylanders", name: "Skylanders", color: "#00A0FF" },
  { id: "disney_infinity", name: "Disney Infinity", color: "#FF1493" },
] as const;

export default function PortalManager() {
  const { user } = useAuth();
  const [selectedColor, setSelectedColor] = useState("#0000FF");
  
  const { data: portals, isLoading } = trpc.portal.getAllPortals.useQuery();
  const { data: figures } = trpc.portal.getFiguresOnPortal.useQuery("lego_dimensions");
  
  const setLEDColor = trpc.portal.setLEDColor.useMutation();
  const togglePower = trpc.portal.togglePower.useMutation();

  if (!user) return null;

  const handleSetColor = async (platform: typeof PLATFORMS[number]["id"]) => {
    await setLEDColor.mutateAsync({
      platform,
      color: selectedColor,
    });
  };

  const handleTogglePower = async (
    platform: typeof PLATFORMS[number]["id"],
    isActive: boolean
  ) => {
    await togglePower.mutateAsync({
      platform,
      isActive: !isActive,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Portal Manager</h1>
          <p className="text-muted-foreground">
            Control and manage your toy portals
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORMS.map((platform) => {
              const portal = portals?.find((p) => p.platform === platform.id);
              const isActive = portal?.isActive === 1;

              return (
                <Card key={platform.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>Portal emulation</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Portal LED Visualization */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Portal LED</label>
                      <div
                        className="w-full h-24 rounded-lg border-2 border-border transition-colors"
                        style={{
                          backgroundColor: portal?.ledColor || "#0000FF",
                        }}
                      />
                    </div>

                    {/* LED Color Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LED Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="h-10 w-16 rounded cursor-pointer"
                        />
                        <Button
                          onClick={() => handleSetColor(platform.id)}
                          disabled={setLEDColor.isPending}
                          className="flex-1"
                          variant="outline"
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                      </div>
                    </div>

                    {/* Power Toggle */}
                    <Button
                      onClick={() => handleTogglePower(platform.id, isActive)}
                      disabled={togglePower.isPending}
                      variant={isActive ? "destructive" : "default"}
                      className="w-full"
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {isActive ? "Turn Off" : "Turn On"}
                    </Button>

                    {/* Figures Count */}
                    <div className="text-sm text-muted-foreground">
                      {figures ? (
                        <p>{figures.length} figure(s) available</p>
                      ) : (
                        <p>Loading figures...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Status Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Portal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => {
                const portal = portals?.find((p) => p.platform === platform.id);
                return (
                  <div key={platform.id} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">{platform.name}</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        Status:{" "}
                        <Badge variant={portal?.isActive === 1 ? "default" : "secondary"}>
                          {portal?.isActive === 1 ? "Online" : "Offline"}
                        </Badge>
                      </p>
                      <p>LED: {portal?.ledColor || "N/A"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
