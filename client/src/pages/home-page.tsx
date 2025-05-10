import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AiRecommendationForm } from "@/components/ai-recommendation-form";
import { ArtistCard } from "@/components/artist-card";
import { StyleGallery } from "@/components/style-gallery";
import { SpecialOptions } from "@/components/special-options";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  // Fetch featured artists
  const { data: artists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["/api/artists"],
    queryFn: async () => {
      const res = await fetch("/api/artists");
      if (!res.ok) throw new Error("Failed to fetch artists");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-light">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section 
          className="relative h-[500px]" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1621112904887-419379ce6824?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"></div>
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-5xl md:text-7xl font-heading text-light mb-4">Book Your <span className="text-secondary">Ink Journey</span></h1>
            <p className="text-xl text-light max-w-lg mb-8">Schedule appointments with our talented artists and bring your tattoo vision to life.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <Link href="/booking">
                <Button className="bg-primary hover:bg-opacity-90 text-light px-6 py-3 rounded-lg font-semibold transition duration-200">
                  Book Appointment
                </Button>
              </Link>
              <Link href="/artists">
                <Button variant="outline" className="border-light hover:border-secondary text-light hover:text-secondary px-6 py-3 rounded-lg font-semibold transition duration-200">
                  Meet Our Artists
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* AI Recommendation Form */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-900 py-10 border-t border-b border-gray-800">
          <div className="container mx-auto px-4">
            <AiRecommendationForm />
          </div>
        </section>

        {/* Artists Showcase */}
        <section className="py-16 bg-dark">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-heading text-light text-center mb-3">Our Master Artists</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Each with their own unique style and expertise, our talented team is ready to bring your vision to life.</p>

            {isLoadingArtists ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <Skeleton className="w-full h-64" />
                    <div className="p-5">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : artists && artists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {artists.map((artist: any) => {
                  const status = artist.isAvailable 
                    ? "Available" 
                    : Math.random() > 0.5 
                      ? "Limited Slots" 
                      : "Fully Booked";
                  
                  return (
                    <ArtistCard
                      key={artist.id}
                      id={artist.id}
                      name={artist.fullName}
                      specialty={artist.specialty}
                      bio={artist.bio}
                      image={artist.profileImage || `https://pixabay.com/get/g6abe3c74e2f438860b22a25bebe7b82f0065d48cb3fec7ce85cc240034284576a533bec90200c2574a078b7858abbf4e427863fd312ea5f96a780d24b8486948_1280.jpg`}
                      status={status as any}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
                <p className="text-gray-400">No artists available at this time. Please check back later.</p>
              </div>
            )}
          </div>
        </section>

        {/* Special Options Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-heading text-light text-center mb-3">Special Booking Options</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Can't find the perfect time slot? Try these options.</p>
            
            <SpecialOptions />
          </div>
        </section>

        {/* Tattoo Style Gallery */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-dark">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-heading text-light text-center mb-3">Explore Tattoo Styles</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Browse our artists' work by style to find inspiration for your next tattoo.</p>

            <StyleGallery />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
