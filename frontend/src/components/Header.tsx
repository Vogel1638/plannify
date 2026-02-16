"use client";


import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/Button";
import { CreateEventModal } from "./modals/CreateEventModal";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";



export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const response = await res.json();
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Token ungültig oder abgelaufen
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/";
  };

  // Event-Erstellung wie im Dashboard
  const handleCreateEvent = async (eventData: any) => {
    try {
      const token = localStorage.getItem("token");
      // Debug-Ausgaben wie im Dashboard
      console.log("=== EVENT CREATION DEBUG ===");
      console.log("Event Data being sent:", eventData);
      console.log("Token:", token ? "Present" : "Missing");
      console.log("URL:", "http://localhost:8000/api/v1/events");

      const res = await fetch("http://localhost:8000/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      console.log("Response Status:", res.status);
      console.log("Response OK:", res.ok);

      if (res.ok) {
        const responseData = await res.json();
        console.log("Response Data:", responseData);
        setIsCreateModalOpen(false);
        // Optional: Toast oder Notification für Erfolg
      } else {
        const errorData = await res.json();
        console.log("Error Response:", errorData);
        throw new Error(errorData.message || "Fehler beim Erstellen des Events");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      // Optional: Fehler-Toast oder Notification
    }
  };

  // Close mobile nav on route change or outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const nav = document.getElementById("mobile-nav");
      const burger = document.getElementById("mobile-burger");
      if (
        mobileNavOpen &&
        nav &&
        !nav.contains(e.target as Node) &&
        burger &&
        !burger.contains(e.target as Node)
      ) {
        setMobileNavOpen(false);
      }
    }
    if (mobileNavOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileNavOpen]);

    return (
      <>
        <header className="bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm sticky top-0 z-30 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-900 hover:text-blue-700 transition">
                  Plannify
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-2 bg-blue-50/60 rounded-full px-4 py-1 shadow-sm border border-blue-100">
                <Link href="/" className="text-blue-800 hover:text-blue-900 px-4 py-2 text-base font-medium rounded-full transition">
                  Home
                </Link>
                <Link href="/events" className="text-blue-800 hover:text-blue-900 px-4 py-2 text-base font-medium rounded-full transition">
                  Events
                </Link>
              </nav>

              {/* Mobile Hamburger */}
              <button
                id="mobile-burger"
                className="items-center justify-center w-10 h-10 rounded-full text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 flex md:hidden"
                aria-label="Menü öffnen"
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* User Actions Desktop */}
              <div className="items-center gap-2 hidden md:flex">
                {loading ? (
                  <span className="text-blue-400">Lade...</span>
                ) : isAuthenticated ? (
                  <>
                    <Button
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-full text-base font-semibold shadow-md transition"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus /> Event erstellen
                    </Button>
                    <div className="relative" ref={profileRef}>
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 select-none"
                        onClick={() => setDropdownOpen((v) => !v)}
                        aria-label="Profilmenü öffnen"
                      >
                        {(user?.display_name || user?.name || "B").charAt(0).toUpperCase()}
                      </button>
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-blue-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-blue-900 hover:bg-blue-50 rounded-t-xl transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-b-xl transition"
                          >
                            Abmelden
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-blue-700 hover:text-white hover:bg-blue-700 px-4 py-2 text-base font-medium rounded-full transition"
                    >
                      Anmelden
                    </Link>
                    <Link 
                      href="/register" 
                      className="bg-blue-700 text-white px-4 py-2 rounded-full text-base font-semibold hover:bg-blue-800 transition"
                    >
                      Registrieren
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Mobile Navigation Drawer */}
          <div
            id="mobile-nav"
            className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileNavOpen ? "visible" : "invisible pointer-events-none"}`}
            aria-hidden={!mobileNavOpen}
          >
            {/* Overlay */}
            <div
              className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${mobileNavOpen ? "opacity-100" : "opacity-0"}`}
              onClick={() => setMobileNavOpen(false)}
            />
            {/* Drawer */}
            <div
              className={`absolute top-0 right-0 h-full w-full bg-white bg-gradient-to-b from-blue-50 via-white to-white shadow-xl border-l border-blue-100 flex flex-col transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="flex items-center justify-between p-6">
                <span className="text-xl font-bold text-blue-900">Menü</span>
                <button
                  className="text-blue-700 hover:bg-blue-100 rounded-full p-2 focus:outline-none"
                  aria-label="Menü schließen"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-white p-6">
                <Link
                  href="/"
                  className="block text-blue-800 hover:text-blue-900 px-4 py-2 text-base font-medium rounded transition"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/events"
                  className="block text-blue-800 hover:text-blue-900 px-4 py-2 text-base font-medium rounded transition"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Events
                </Link>
                {isAuthenticated ? (
                  <>
                    <Button
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-full text-base font-semibold shadow-md transition w-full mt-2"
                      onClick={() => {
                        setIsCreateModalOpen(true);
                        setMobileNavOpen(false);
                      }}
                    >
                      + Event
                    </Button>
                    <Link
                      href="/dashboard"
                      className="block text-blue-900 hover:bg-blue-50 px-4 py-2 rounded transition mt-2"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileNavOpen(false);
                      }}
                      className="block w-full text-left text-blue-700 hover:bg-blue-50 px-4 py-2 rounded transition mt-2"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-blue-700 hover:text-white hover:bg-blue-700 px-4 py-2 text-base font-medium rounded transition mt-2"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      Anmelden
                    </Link>
                    <Link
                      href="/register"
                      className="block bg-blue-700 text-white px-4 py-2 rounded-full text-base font-semibold hover:bg-blue-800 transition mt-2"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      Registrieren
                    </Link>
                  </>
                )}        
              </div>
              
            </div>
          </div>
        </header>
        {/* Render modal at end of body using portal so it overlays whole page */}
        {typeof window !== "undefined" && isCreateModalOpen && createPortal(
          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateEvent}
          />, 
          document.body
        )}
      </>
    );
}
