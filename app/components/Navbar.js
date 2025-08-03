'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import  { useAuth }  from '../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
// import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { GiHamburgerMenu } from "react-icons/gi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger, 
} from '../../components/ui/dropdown-menu';
import { 
  IoHomeOutline, 
  IoLogOutOutline, 
  IoPeopleOutline, 
  IoPersonCircleOutline, 
  IoShield, 
  IoShieldCheckmark, 
  IoShieldCheckmarkOutline, 
  IoShieldCheckmarkSharp, 
  IoShieldOutline 
} from "react-icons/io5";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();
    const {logout, username, role } = useAuth();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            setIsMobileMenuOpen(false)
            // toast.success('Déconnexion réussie');
            router.push('/');
        } catch (error) {
            // toast.error('Erreur lors de la déconnexion');
            console.error(error);
        }
    }, [logout, router]);

    const navItemsMobile = [
        { href: "/", label: "Accueil", icon: <IoHomeOutline className="w-6 h-6 text-amber-600" /> },
        { href: "/personnes", label: "Personnes", icon: <IoPersonCircleOutline className="w-6 h-6 text-amber-600" /> },
        { href: "/familles", label: "Familles", icon: <IoPeopleOutline className="w-6 h-6 text-amber-600" /> },
    ];

    const navItemsDesktop = [
                        { to: "/", text: "Accueil" },
                        { to: "/personnes", text: "Personnes" },
                        { to: "/familles", text: "Familles" },
                       ]

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 767) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header className='w-full bg-gradient-to-r from-cyan-400 to-purple-700 border-b-4 border-cyan-400 shadow-lg py-2 px-6 flex items-center justify-between z-50 relative'>
            <div className='container mx-auto px-2 sm:px-3 max-w-7xl flex items-center h-full'>
                {/* Première section: Burger + Logo */}
                <div className="flex items-center flex-shrink-0 mr-auto">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-4">
                        <Image 
                            src='/arbre.png'
                            width={56}
                            height={56} 
                            alt='logo'
                            className='w-10 h-10 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded object-cover'
                        />
                        <span className='!text-white text-2xl font-bold drop-shadow-[0_0_8px_#0dcaf0] group-hover:text-cyan-300 transition hidden lg:block'>Généalogie</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}

                {username && (
                  <div className="hidden md:flex items-center justify-center flex-1 gap-[clamp(1rem,3.5vw,5rem)]">
                    {navItemsDesktop.map(link => (
                        <Link 
                            key={link.to}
                            href={link.to} 
                            className={`text-[clamp(1.0rem,2vw,1.3rem)] font-bold transition-colors relative
                                ${pathname === link.to 
                                ? "!text-amber-600  after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[3px] after:bg-amber-600" 
                                : "!text-gray-300  hover:!text-amber-600"}`}
                        >
                            {link.text}
                        </Link>
                        ))}
                    {role === 'admin' && (
                      <Link 
                          href="/admin" 
                          className={`text-[clamp(1.0rem,2vw,1.3rem)] font-bold transition-colors relative bg-gray-800 px-2 py-1 rounded-xl 
                              ${pathname === '/admin' 
                              ? "!text-amber-600  after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[3px] after:bg-amber-600" 
                              : "!text-gray-300  hover:!text-amber-600"}`}
                      >
                          Administration
                      </Link>
                    )}  
                  </div>
                )}

                
                {/* Right Section */}
                <div className="flex items-center gap-2 ml-auto">
                    {username &&  (
                      <>
                        <div className='hidden md:block'>
                          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                            <DropdownMenuTrigger asChild>
                                {username &&  (
                                    <div className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">     
                                      Salam, <span className="font-bold text-amber-400">{username.charAt(0).toUpperCase() + username.slice(1)}</span> 👋
                                    </div>
                                )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 dark:bg-gray-100 bg-gray-900 text-amber-600 border-none rounded-lg shadow-lg">
                              <DropdownMenuItem
                                  onClick={handleLogout}
                                  className="flex justify-center py-2 text-lg font-bold cursor-pointer rounded-lg"
                              >
                                  Déconnexion
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className='block md:hidden'>
                            <div className=" flex items-center gap-2 px-2 py-1 rounded-full transition-colors">
                                Salam, <span className="font-bold text-amber-400">{username.charAt(0).toUpperCase() + username.slice(1)}</span> 👋
                            </div>
                        </div>
        
                        
                        {/* Burger Menu */}
                        <div className="md:hidden mr-1 ">
                            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="p-1 m-2 !bg-gray-800">
                                        <GiHamburgerMenu  size={48} className="text-amber-600 stroke-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-48 bg-gray-800 text-amber-600 border-none rounded-lg shadow-lg"
                                >
                                    {navItemsMobile.map((item, index) => (
                                        <Link 
                                            key={index} 
                                            href={item.href} 
                                            className="flex items-center gap-2 p-3 hover:bg-gray-600 hover:text-gray-200 rounded-lg m-1"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.icon}
                                            <span className="text-lg font-bold">{item.label}</span>
                                        </Link>
                                    ))}
                                    { role === 'admin' && (
                                        <Link 
                                            href="/admin" 
                                            className="flex items-center gap-2 p-3 hover:bg-gray-600 hover:text-gray-200 rounded-lg m-1"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          <IoShieldCheckmark className="w-6 h-6 text-amber-600"/>
                                            <span className="text-lg font-bold">Administration</span>
                                        </Link>
                                    )}
                                    <Link
                                      href={'/'}
                                      onClick={handleLogout} 
                                      className="flex items-center gap-2 p-3 hover:bg-gray-600 hover:text-gray-200 rounded-lg m-1 cursor-pointer"
                                      >
                                        <IoLogOutOutline className="w-6 h-6 text-amber-600"/>                                      
                                      <span className="text-lg font-bold">Déconnexion</span>
                                  </Link>             
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </>
                    )}
                </div>
            </div>
        </header>
    );
};