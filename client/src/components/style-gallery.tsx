import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface TattooStyle {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export function StyleGallery() {
  const { data: styles, isLoading } = useQuery({
    queryKey: ["/api/tattoo-styles"],
    queryFn: async () => {
      const res = await fetch("/api/tattoo-styles");
      if (!res.ok) throw new Error("Failed to fetch tattoo styles");
      return res.json() as Promise<TattooStyle[]>;
    },
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <Skeleton className="w-full h-48" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {styles?.map((style) => (
        <a key={style.id} href="#" className="block rounded-lg overflow-hidden group relative">
          <img 
            src={style.imageUrl} 
            alt={`${style.name} Style Tattoo`} 
            className="w-full h-48 object-cover transition duration-300 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 p-3">
            <h3 className="text-light font-heading">{style.name}</h3>
          </div>
        </a>
      ))}
    </div>
  );
}
