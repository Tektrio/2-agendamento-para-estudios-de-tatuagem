import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MobileSideMenu } from "./mobile-menu";
import { Menu, User, LogOut } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigation = [
    { name: "Book Now", href: "/booking" },
    { name: "Artists", href: "/artists" },
    { name: "Gallery", href: "/gallery" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];
  
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-3xl font-heading text-primary mr-2 cursor-pointer">InkSync</h1>
          </Link>
          <span className="text-secondary font-accent text-sm">Tattoo Studio</span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
            >
              <a className={`text-light hover:text-primary transition duration-200 ${location === item.href ? 'text-primary' : ''}`}>
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="hidden md:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth">
              <a className="hidden md:block bg-primary text-light px-4 py-2 rounded hover:bg-opacity-90 transition duration-200">
                Sign In
              </a>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-light"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <MobileSideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        navigation={navigation}
      />
    </header>
  );
}
