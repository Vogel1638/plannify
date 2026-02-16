"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CreateEventModal } from "../../components/modals/CreateEventModal";
import { Button } from "../../components/ui/Button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log("My Events state changed:", myEvents.length, "events");
  }, [myEvents]);
  
  useEffect(() => {
    console.log("Participating Events state changed:", participatingEvents.length, "events");
  }, [participatingEvents]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const router = useRouter();

  const fetchEvents = async (userId?: number) => {
    try {
      setEventsLoading(true);
      const token = localStorage.getItem("token");
      setError(null);
      const res = await fetch("http://localhost:8000/api/v1/events", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const events = data.data || [];
        const currentUserId = userId || user?.id;
        const now = new Date();

        // Vergangene Events (Ende vor jetzt)
        const isPast = (event: any) => {
          // Wenn ends_at existiert, sonst fallback auf starts_at
          const end = event.ends_at ? new Date(event.ends_at) : new Date(event.starts_at);
          return end < now;
        };

        // Kommende Events (Ende nach jetzt)
        const isUpcoming = (event: any) => !isPast(event);

        // Eigene Events (kommend)
        const myEventsList = events.filter((event: any) => event.host?.id === currentUserId && isUpcoming(event));
        // Teilnehmende Events (kommend)
        const participatingEventsList = events.filter((event: any) => {
          const isParticipant = event.participants?.some((participant: any) => participant.id === currentUserId && (participant.status === 'going' || participant.status === 'pending'));
          return isParticipant && isUpcoming(event);
        });
        // Vergangene Events (egal ob host oder teilnehmer)
        const pastEventsList = events.filter((event: any) => {
          const isHost = event.host?.id === currentUserId;
          const isParticipant = event.participants?.some((participant: any) => participant.id === currentUserId && (participant.status === 'going' || participant.status === 'pending'));
          return (isHost || isParticipant) && isPast(event);
        });

        setMyEvents(myEventsList);
        setParticipatingEvents(participatingEventsList);
        setPastEvents(pastEventsList);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Fehler beim Laden der Events.");
      }
    } catch (err: any) {
      setError(err.message || "Fehler beim Laden der Events.");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          const currentPath = window.location.pathname + window.location.search;
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          localStorage.removeItem("token");
          const currentPath = window.location.pathname + window.location.search;
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
        
        const data = await res.json();
        console.log("User data from API:", data);
        const userData = data.data || data;
        setUser(userData);
        
        // Lade Events nach erfolgreicher Authentifizierung
        console.log("User loaded, fetching events...");
        console.log("User ID from data:", userData.id);
        await fetchEvents(userData.id);
      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem("token");
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } finally {
        setLoading(false);
      }
    }


    fetchUser();
  }, [router]);

  const handleCreateEvent = async (eventData: any) => {
    try {
      const token = localStorage.getItem("token");
      
      // Console-Log für Debugging
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
        
        // Event erfolgreich erstellt
        setIsCreateModalOpen(false);
        // Events neu laden
        console.log("Reloading events after creation...")
        const userId = responseData.data?.host?.id || user?.id;
        console.log("User ID for reload:", userId);
        await fetchEvents(userId);
      } else {
        const errorData = await res.json();
        console.log("Error Response:", errorData);
        throw new Error(errorData.message || "Fehler beim Erstellen des Events");
      }
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lade Dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <p className="text-red-600">Fehler: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      

      <main className="flex-1 bg-gradient-to-br from-white via-blue-50 to-blue-100 min-h-screen">
        <div className="max-w-9xl mx-auto px-4 sm:px-8 py-10">
          <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight mb-1">Willkommen, {user?.name}!</h1>
              <p className="text-lg text-blue-700">Dein persönliches Event-Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full text-base font-semibold shadow-md transition"><Plus /> Event erstellen</Button>
              <Link href="/events" className="bg-white border border-blue-200 text-blue-800 px-6 py-2 rounded-full text-base font-semibold shadow-sm hover:bg-blue-50 transition">Alle Events</Link>
            </div>
          </header>

          <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start justify-center bg-white/80 shadow-sm rounded-2xl border border-blue-100 p-6 min-h-[120px] transition hover:shadow-md">
              <span className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-2">Profil</span>
              <span className="text-2xl font-bold text-blue-900 mb-1">{user?.name}</span>
              <span className="text-base text-blue-700 mb-1">{user?.email}</span>
            </div>
            <div className="flex flex-col items-start justify-center bg-white/80 shadow-sm rounded-2xl border border-blue-100 p-6 min-h-[120px] transition hover:shadow-md">
              <span className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-2">Eigene Events</span>
              <span className="text-2xl font-bold text-blue-900 mb-1">{myEvents.length}</span>
              <span className="text-base text-blue-700 mb-1">Erstellt</span>
            </div>
            <div className="flex flex-col items-start justify-center bg-white/80 shadow-sm rounded-2xl border border-blue-100 p-6 min-h-[120px] transition hover:shadow-md">
              <span className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-2">Teilnahmen</span>
              <span className="text-2xl font-bold text-blue-900 mb-1">{participatingEvents.length}</span>
              <span className="text-base text-blue-700 mb-1">Aktiv</span>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white/80 shadow-sm rounded-2xl border border-blue-100 p-6 transition hover:shadow-md">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Meine Events</h2>
              {eventsLoading ? (
                <p className="text-blue-700">Lade Events...</p>
              ) : myEvents.length > 0 ? (
                <ul className="divide-y divide-blue-50">
                  {myEvents.map((event) => (
                    <li key={event.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 rounded-lg transition">
                      <div>
                        <Link href={`/events/${event.public_slug || event.private_slug || event.id}`} className="text-lg font-semibold text-blue-800 hover:underline">
                          {event.title}
                        </Link>
                        <p className="text-sm text-blue-700">{event.description}</p>
                      </div>
                      <span className="text-xs text-blue-500 mt-2 md:mt-0 md:ml-4">
                        {new Date(event.starts_at).toLocaleDateString('de-DE')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-700">Keine eigenen Events.</p>
              )}
            </div>
            <div className="bg-white/80 shadow-sm rounded-2xl border border-blue-100 p-6 transition hover:shadow-md">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Teilnehmende Events</h2>
              {eventsLoading ? (
                <p className="text-blue-700">Lade Events...</p>
              ) : participatingEvents.length > 0 ? (
                <ul className="divide-y divide-blue-50">
                  {participatingEvents.map((event) => {
                    const userParticipation = event.participants?.find((p: any) => p.id === user?.id);
                    return (
                      <li key={event.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 rounded-lg transition p-5">
                        <div className="max-w-sm">
                          <Link href={`/events/${event.public_slug || event.private_slug || event.id}`} className="text-lg font-semibold text-blue-800 hover:underline">
                            {event.title}
                          </Link>
                          <p className="text-sm text-blue-700">{event.description}</p>
                        </div>
                        <div className="flex flex-col md:items-end mt-2 md:mt-0 md:ml-4">
                          <span className="text-xs text-blue-500">
                            {new Date(event.starts_at).toLocaleDateString('de-DE', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs mt-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
                            {userParticipation?.status === 'going' ? 'Teilnahme bestätigt' : userParticipation?.status === 'pending' ? 'Wartend' : userParticipation?.status || 'Unbekannt'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-blue-700">Keine Teilnahmen.</p>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div className="bg-white/80 shadow-sm rounded-2xl border border-blue-100 p-6 transition hover:shadow-md">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Vergangene Events</h2>
              {eventsLoading ? (
                <p className="text-blue-700">Lade Events...</p>
              ) : pastEvents.length > 0 ? (
                <ul className="divide-y divide-blue-50">
                  {pastEvents.map((event) => (
                    <li key={event.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between opacity-60 hover:bg-blue-50 rounded-lg transition">
                      <div>
                        <Link href={`/events/${event.public_slug || event.private_slug || event.id}`} className="text-lg font-semibold text-blue-800 hover:underline">
                          {event.title}
                        </Link>
                        <p className="text-sm text-blue-700">{event.description}</p>
                      </div>
                      <span className="text-xs text-blue-500 mt-2 md:mt-0 md:ml-4">
                        {new Date(event.starts_at).toLocaleDateString('de-DE', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {event.ends_at && (
                          <> – {new Date(event.ends_at).toLocaleDateString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-700">Keine vergangenen Events.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      
      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}