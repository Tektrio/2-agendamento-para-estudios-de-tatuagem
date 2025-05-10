import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-heading text-light mb-6">InkSync Studio</h3>
            <p className="text-gray-400 mb-6">
              Our advanced booking system ensures you get the perfect appointment with the right artist for your tattoo vision.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-secondary transition duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition duration-200">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition duration-200">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-light font-heading mb-6">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/booking">
                  <a className="hover:text-secondary transition duration-200">Book Appointment</a>
                </Link>
              </li>
              <li>
                <Link href="/artists">
                  <a className="hover:text-secondary transition duration-200">Meet Our Artists</a>
                </Link>
              </li>
              <li>
                <Link href="/gallery">
                  <a className="hover:text-secondary transition duration-200">Tattoo Styles</a>
                </Link>
              </li>
              <li>
                <Link href="/waitlist">
                  <a className="hover:text-secondary transition duration-200">Join Waitlist</a>
                </Link>
              </li>
              <li>
                <Link href="/policies">
                  <a className="hover:text-secondary transition duration-200">Studio Policies</a>
                </Link>
              </li>
              <li>
                <Link href="/aftercare">
                  <a className="hover:text-secondary transition duration-200">Aftercare Instructions</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-light font-heading mb-6">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-secondary flex-shrink-0" />
                <span>123 Ink Street, Tattoo District, TC 12345</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-secondary flex-shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-secondary flex-shrink-0" />
                <span>booking@inksync.com</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-secondary flex-shrink-0" />
                <span>Mon-Sat: 10AM-8PM, Sun: Closed</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-light font-heading mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new artist availability and special events.
            </p>
            <form className="space-y-3">
              <div>
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-gray-800 border border-gray-700 text-light focus:ring-primary" 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-opacity-90 text-light transition duration-200"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} InkSync Tattoo Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
