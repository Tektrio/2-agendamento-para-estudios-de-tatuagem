import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { WaitlistForm } from "./waitlist-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SpecialOptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  
  const handleUnauthorizedAction = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use this feature",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Waitlist Option */}
      <Card className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-primary transition duration-300">
        <div className="mb-4 text-secondary">
          <Clock className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-heading text-light mb-2">Join The Waitlist</h3>
        <p className="text-gray-400 mb-4">Get notified when your preferred artist has a cancellation or adds new availability.</p>
        <ul className="text-gray-400 text-sm mb-5 space-y-2">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI-powered matching to your preferences</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>First access to newly opened slots</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Instant notifications via text or email</span>
          </li>
        </ul>
        <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="secondary" 
              className="w-full text-light"
              onClick={() => {
                if (!user) {
                  handleUnauthorizedAction();
                }
              }}
            >
              Join Waitlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-light">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Join Our Waitlist</DialogTitle>
            </DialogHeader>
            <WaitlistForm onSuccess={() => setWaitlistOpen(false)} />
          </DialogContent>
        </Dialog>
      </Card>

      {/* Custom Request Option */}
      <Card className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-primary transition duration-300">
        <div className="mb-4 text-secondary">
          <Edit className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-heading text-light mb-2">Custom Booking Request</h3>
        <p className="text-gray-400 mb-4">Need something specific? Submit a custom request and we'll do our best to accommodate.</p>
        <ul className="text-gray-400 text-sm mb-5 space-y-2">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Request specific dates outside normal availability</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Book extended sessions for larger projects</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Create custom multi-session scheduling</span>
          </li>
        </ul>
        <Button 
          variant="secondary" 
          className="w-full text-light"
          onClick={() => {
            if (user) {
              navigate("/booking?custom=true");
            } else {
              handleUnauthorizedAction();
            }
          }}
        >
          Submit Request
        </Button>
      </Card>

      {/* Emergency/Last Minute Option */}
      <Card className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-primary transition duration-300">
        <div className="mb-4 text-secondary">
          <Zap className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-heading text-light mb-2">Last-Minute Availability</h3>
        <p className="text-gray-400 mb-4">Check our AI-updated list of last-minute cancellations and openings.</p>
        <ul className="text-gray-400 text-sm mb-5 space-y-2">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Real-time updates for sudden openings</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Special pricing for same-day availability</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Perfect for small, spontaneous tattoos</span>
          </li>
        </ul>
        <Button 
          className="w-full bg-accent hover:bg-opacity-90 text-light"
          onClick={() => {
            if (user) {
              navigate("/booking?lastMinute=true");
            } else {
              handleUnauthorizedAction();
            }
          }}
        >
          Check Availability
        </Button>
      </Card>
    </div>
  );
}
