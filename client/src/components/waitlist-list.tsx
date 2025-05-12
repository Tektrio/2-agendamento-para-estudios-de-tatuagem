import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, CalendarIcon, CheckCircle, UserIcon, ClockIcon, TagIcon, XCircle } from "lucide-react";
import { format } from "date-fns";

interface WaitlistEntry {
  id: number;
  userId: number;
  artistId: number | null;
  description: string;
  tattooStyle: string | null;
  tattooSize: string | null;
  preferredDates: string | null;
  budgetRange: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Artist {
  id: number;
  fullName: string;
  specialty: string;
}

interface WaitlistListProps {
  artistId?: number;
  onUpdateEntry?: () => void;
}

export function WaitlistList({ artistId, onUpdateEntry }: WaitlistListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  
  const waitlistUrl = artistId 
    ? `/api/artists/${artistId}/waitlist` 
    : "/api/waitlist";
  
  const { data: waitlistEntries, isLoading, error } = useQuery({
    queryKey: [waitlistUrl],
    queryFn: async () => {
      const res = await fetch(waitlistUrl);
      if (!res.ok) throw new Error("Failed to fetch waitlist entries");
      return res.json();
    },
    enabled: !!user,
  });
  
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
    queryFn: async () => {
      const res = await fetch("/api/artists");
      if (!res.ok) throw new Error("Failed to fetch artists");
      return res.json();
    },
    enabled: !!user,
  });
  
  // Convert tattoo style from key to display name
  const getTattooStyleName = (key: string | null): string => {
    if (!key) return "Not specified";
    
    const styles: Record<string, string> = {
      "traditional": "Traditional",
      "neo-traditional": "Neo-Traditional",
      "realism": "Realism",
      "watercolor": "Watercolor",
      "geometric": "Geometric",
      "japanese": "Japanese",
      "tribal": "Tribal",
      "blackwork": "Blackwork",
    };
    
    return styles[key] || key;
  };
  
  // Convert tattoo size from key to display name
  const getTattooSizeName = (key: string | null): string => {
    if (!key) return "Not specified";
    
    const sizes: Record<string, string> = {
      "small": "Small (1-2 hours)",
      "medium": "Medium (3-5 hours)",
      "large": "Large (6-8 hours)",
      "extra-large": "Extra Large (Multiple sessions)",
    };
    
    return sizes[key] || key;
  };
  
  // Convert budget range from key to display value
  const getBudgetRangeName = (key: string | null): string => {
    if (!key) return "Not specified";
    
    const budgets: Record<string, string> = {
      "budget": "$100-$300",
      "mid-range": "$300-$600",
      "premium": "$600-$1000",
      "custom": "$1000+",
    };
    
    return budgets[key] || key;
  };
  
  // Find artist name by ID
  const getArtistName = (artistId: number | null): string => {
    if (!artistId || !artists) return "Any artist";
    const artist = artists.find((a: Artist) => a.id === artistId);
    return artist ? artist.fullName : "Unknown artist";
  };
  
  // Mutation to remove an entry from the waitlist
  const removeEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      await apiRequest("DELETE", `/api/waitlist/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [waitlistUrl] });
      toast({
        title: "Removed from waitlist",
        description: "The waitlist entry has been removed",
      });
      if (onUpdateEntry) {
        onUpdateEntry();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from waitlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleRemoveEntry = (entryId: number) => {
    setDeletingEntryId(entryId);
    removeEntryMutation.mutate(entryId);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-red-500">
        <p>Error loading waitlist entries. Please try again.</p>
      </div>
    );
  }
  
  if (!waitlistEntries || waitlistEntries.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] p-6 text-center border border-dashed rounded-lg border-gray-700">
        <ClockIcon className="h-12 w-12 text-gray-500 mb-2" />
        <h3 className="text-lg font-medium">No waitlist entries found</h3>
        <p className="text-gray-500 mt-1">
          {artistId 
            ? "This artist doesn't have any waitlist entries yet." 
            : "You haven't joined any waitlists yet."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {waitlistEntries
        .filter((entry: WaitlistEntry) => entry.isActive)
        .map((entry: WaitlistEntry) => (
          <Card key={entry.id} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {getTattooStyleName(entry.tattooStyle)}
                    </Badge>
                    {getTattooSizeName(entry.tattooSize)}
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-400">
                    Added on {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <Badge 
                  variant={entry.isActive ? "default" : "secondary"}
                  className={entry.isActive ? "bg-green-700" : "bg-gray-700"}
                >
                  {entry.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Artist: {getArtistName(entry.artistId)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Preferred dates: {entry.preferredDates || "Flexible"}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <TagIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Budget: {getBudgetRangeName(entry.budgetRange)}</span>
                </div>
                
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Description:</h4>
                  <p className="text-sm text-gray-300 whitespace-pre-line">
                    {entry.description}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="ml-auto"
                    disabled={removeEntryMutation.isPending && deletingEntryId === entry.id}
                  >
                    {removeEntryMutation.isPending && deletingEntryId === entry.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border border-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove from Waitlist</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this entry from the waitlist? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-700 hover:bg-red-600 text-white"
                      onClick={() => handleRemoveEntry(entry.id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}