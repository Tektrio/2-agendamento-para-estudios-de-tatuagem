import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { joinWaitlist } from "@/lib/ai-service";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  artistId: z.string().optional(),
  tattooStyle: z.string().min(1, "Please select a tattoo style"),
  tattooSize: z.string().min(1, "Please select a tattoo size"),
  preferredDates: z.string().min(3, "Please provide preferred dates"),
  budgetRange: z.string().min(1, "Please select a budget range"),
  description: z.string().min(10, "Please describe your tattoo idea").max(500, "Description is too long"),
});

interface WaitlistFormProps {
  onSuccess?: () => void;
  artistId?: number;
}

export function WaitlistForm({ onSuccess, artistId }: WaitlistFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch artists for the dropdown if no artistId is provided
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
    queryFn: async () => {
      if (artistId) return []; // Skip fetching if an artist is already specified
      const res = await fetch("/api/artists");
      if (!res.ok) throw new Error("Failed to fetch artists");
      return res.json();
    },
    enabled: !artistId && !!user,
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      artistId: artistId ? artistId.toString() : undefined,
      tattooStyle: "",
      tattooSize: "",
      preferredDates: "",
      budgetRange: "",
      description: "",
    },
  });
  
  const waitlistMutation = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: () => {
      toast({
        title: "Added to waitlist",
        description: "You've been added to the waitlist. We'll notify you when a slot becomes available.",
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join waitlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join the waitlist",
        variant: "destructive",
      });
      return;
    }
    
    waitlistMutation.mutate({
      artistId: values.artistId ? parseInt(values.artistId) : undefined,
      tattooStyle: values.tattooStyle,
      tattooSize: values.tattooSize,
      preferredDates: values.preferredDates,
      budgetRange: values.budgetRange,
      description: values.description,
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!artistId && (
          <FormField
            control={form.control}
            name="artistId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-light">Preferred Artist (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={waitlistMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger className="bg-gray-800 border border-gray-700 text-light">
                      <SelectValue placeholder="Any artist" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border border-gray-700">
                    {artists?.map((artist: any) => (
                      <SelectItem key={artist.id} value={artist.id.toString()}>
                        {artist.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-gray-400">
                  Leave empty if you don't have a specific artist preference.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="tattooStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-light">Tattoo Style</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={waitlistMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger className="bg-gray-800 border border-gray-700 text-light">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border border-gray-700">
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="neo-traditional">Neo-Traditional</SelectItem>
                  <SelectItem value="realism">Realism</SelectItem>
                  <SelectItem value="watercolor">Watercolor</SelectItem>
                  <SelectItem value="geometric">Geometric</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="tribal">Tribal</SelectItem>
                  <SelectItem value="blackwork">Blackwork</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tattooSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-light">Tattoo Size</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={waitlistMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger className="bg-gray-800 border border-gray-700 text-light">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border border-gray-700">
                  <SelectItem value="small">Small (1-2 hours)</SelectItem>
                  <SelectItem value="medium">Medium (3-5 hours)</SelectItem>
                  <SelectItem value="large">Large (6-8 hours)</SelectItem>
                  <SelectItem value="extra-large">Extra Large (Multiple sessions)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="preferredDates"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-light">Preferred Dates/Timeframe</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Weekends in June, Fridays, Next month..."
                  className="bg-gray-800 border border-gray-700 text-light"
                  {...field}
                  disabled={waitlistMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="budgetRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-light">Budget Range</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={waitlistMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger className="bg-gray-800 border border-gray-700 text-light">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border border-gray-700">
                  <SelectItem value="budget">$100-$300</SelectItem>
                  <SelectItem value="mid-range">$300-$600</SelectItem>
                  <SelectItem value="premium">$600-$1000</SelectItem>
                  <SelectItem value="custom">$1000+</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-light">Tattoo Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your tattoo idea, inspiration, and any special requirements..."
                  className="bg-gray-800 border border-gray-700 text-light"
                  {...field}
                  disabled={waitlistMutation.isPending}
                  rows={4}
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                The more details you provide, the better we can match you with the right artist and time slot.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-primary text-white mt-4"
          disabled={waitlistMutation.isPending}
        >
          {waitlistMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Add Me to the Waitlist"
          )}
        </Button>
      </form>
    </Form>
  );
}
