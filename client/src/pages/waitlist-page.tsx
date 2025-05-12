import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/waitlist-form";
import { WaitlistList } from "@/components/waitlist-list";
import { Loader2, PlusCircle, ClipboardList } from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Helmet } from "react-helmet";

export default function WaitlistPage() {
  const { user, isLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("my-entries");
  const [listKey, setListKey] = useState<number>(0);
  
  const refreshList = () => {
    setListKey(prevKey => prevKey + 1);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
    refreshList();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">You need to be logged in</h1>
        <p className="mb-6 text-gray-400">Please log in to view and manage your waitlist entries.</p>
        <Button asChild>
          <a href="/auth">Log In</a>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Waitlist | Tattoo Studio</title>
        <meta name="description" content="Join our waitlist to get notified about available appointments with your preferred tattoo artists." />
      </Helmet>
      <div className="container max-w-5xl px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Waitlist</h1>
            <p className="text-gray-400 mt-1">
              Join our waitlist to get notified about available appointments
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Join Waitlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>Join Our Waitlist</DialogTitle>
                <DialogDescription>
                  Fill out this form to join our waitlist. We'll notify you when a slot becomes available.
                </DialogDescription>
              </DialogHeader>
              <WaitlistForm onSuccess={closeDialog} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="my-entries" className="data-[state=active]:bg-primary">
              <ClipboardList className="mr-2 h-4 w-4" />
              My Waitlist Entries
            </TabsTrigger>
            {user.isArtist && (
              <TabsTrigger value="artist-entries" className="data-[state=active]:bg-primary">
                <ClipboardList className="mr-2 h-4 w-4" />
                Artist Waitlist
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="my-entries" className="mt-0">
            <WaitlistList key={`my-entries-${listKey}`} onUpdateEntry={refreshList} />
          </TabsContent>
          
          {user.isArtist && (
            <TabsContent value="artist-entries" className="mt-0">
              <WaitlistList key={`artist-entries-${listKey}`} artistId={1} onUpdateEntry={refreshList} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}