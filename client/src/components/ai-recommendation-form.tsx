import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiRecommendation, Recommendation } from "@/lib/ai-service";
import { formatDate } from "@/lib/utils";
import { Lightbulb, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const formSchema = z.object({
  tattooStyle: z.string().min(1, "Please select a tattoo style"),
  tattooSize: z.string().min(1, "Please select a tattoo size"),
  preferredDates: z.string().min(3, "Please provide preferred dates"),
  budgetRange: z.string().min(1, "Please select a budget range"),
  description: z.string().min(10, "Please describe your tattoo idea"),
});

export function AiRecommendationForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tattooStyle: "",
      tattooSize: "",
      preferredDates: "",
      budgetRange: "",
      description: "",
    },
  });
  
  const recommendationMutation = useMutation({
    mutationFn: getAiRecommendation,
    onSuccess: (data) => {
      setRecommendation(data);
      toast({
        title: "Recommendation ready!",
        description: "We've found the perfect match for your tattoo idea.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Recommendation failed",
        description: error.message || "Could not generate recommendation. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to use our AI recommendation system.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    recommendationMutation.mutate(values);
  };
  
  return (
    <div>
      {!recommendation ? (
        <Card className="bg-gray-900 bg-opacity-60 rounded-xl backdrop-blur-sm border border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-heading text-light flex items-center">
              <Lightbulb className="h-6 w-6 text-secondary mr-2" />
              Let Our AI Find The Perfect Match For You
            </CardTitle>
            <CardDescription className="text-gray-300">
              Tell us what you're looking for, and our AI will recommend the best artist and time slot for your tattoo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="tattooStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light">Tattoo Style</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={recommendationMutation.isPending}
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
                          defaultValue={field.value}
                          disabled={recommendationMutation.isPending}
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
                        <FormLabel className="text-light">Preferred Dates</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Weekends in June"
                            className="bg-gray-800 border border-gray-700 text-light"
                            {...field}
                            disabled={recommendationMutation.isPending}
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
                          defaultValue={field.value}
                          disabled={recommendationMutation.isPending}
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
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light">Brief Description of Your Tattoo Idea</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your tattoo idea in a few sentences..."
                          className="bg-gray-800 border border-gray-700 text-light"
                          {...field}
                          disabled={recommendationMutation.isPending}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="bg-secondary hover:bg-opacity-90 text-dark font-bold px-8 py-3 rounded-lg transition-all"
                    disabled={recommendationMutation.isPending}
                  >
                    {recommendationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Finding Your Match...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find My Perfect Match
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 bg-opacity-60 rounded-xl backdrop-blur-sm border border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-heading text-light">
              Your Personalized Recommendation
            </CardTitle>
            <CardDescription className="text-gray-300">
              Based on your preferences, our AI has found the perfect match for your tattoo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start md:items-center flex-col md:flex-row gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={recommendation.artist.profileImage || "https://pixabay.com/get/g6abe3c74e2f438860b22a25bebe7b82f0065d48cb3fec7ce85cc240034284576a533bec90200c2574a078b7858abbf4e427863fd312ea5f96a780d24b8486948_1280.jpg"} 
                  alt={recommendation.artist.fullName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-medium text-light">{recommendation.artist.fullName}</h3>
                <p className="text-secondary">{recommendation.artist.specialty}</p>
                <p className="text-gray-400 mt-2">{recommendation.message}</p>
              </div>
            </div>
            
            <div className="border border-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-medium text-light mb-3">Available Dates</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {recommendation.availableDates.slice(0, 8).map((date, index) => (
                  <div key={index} className="bg-gray-800 p-2 rounded text-center text-sm">
                    {formatDate(date)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border border-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-medium text-light mb-3">Recommended Services</h4>
              <div className="space-y-3">
                {recommendation.schedules.map((schedule) => (
                  <div key={schedule.id} className="bg-gray-800 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-light">{schedule.name}</span>
                      <span className="text-secondary">${schedule.price || 'Custom'}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{schedule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate(`/booking?artist=${recommendation.artist.id}`)}
              className="bg-primary text-white w-full sm:w-auto"
            >
              Book with this Artist
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setRecommendation(null)}
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
