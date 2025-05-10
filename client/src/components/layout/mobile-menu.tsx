import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  name: string;
  href: string;
}

interface MobileSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
}

export function MobileSideMenu({ isOpen, onClose, navigation }: MobileSideMenuProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-gray-900 pb-12 shadow-xl">
              <div className="flex px-4 pt-5 pb-2 justify-between items-center">
                <Dialog.Title className="text-2xl font-heading text-primary">
                  InkSync Menu
                </Dialog.Title>
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 border-t border-gray-800 px-4 py-6">
                <div className="space-y-4">
                  {navigation.map((item) => (
                    <div key={item.name} className="flow-root">
                      <Link href={item.href}>
                        <a 
                          className="block p-2 text-light hover:text-primary transition duration-200" 
                          onClick={onClose}
                        >
                          {item.name}
                        </a>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-800 px-4 py-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-light font-medium">{user.fullName}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flow-root">
                      <Link href="/dashboard">
                        <a 
                          className="block p-2 text-light hover:text-primary transition duration-200" 
                          onClick={onClose}
                        >
                          Dashboard
                        </a>
                      </Link>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="w-full" 
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-light mb-2">Create an account or sign in to book your tattoo session.</p>
                    <Link href="/auth">
                      <a onClick={onClose}>
                        <Button className="w-full bg-primary text-white">Sign In</Button>
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
