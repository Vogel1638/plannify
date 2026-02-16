"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CreateEventModal } from "../../components/modals/CreateEventModal";

import { SuccessAlert } from "../../components/ui";
import { Calendar, MapPin } from "lucide-react";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location_name: string;
  location_address: string;
  participant_limit: number;
  visibility: 'public' | 'private';
  allow_comments: boolean;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  starts_at?: string;
  ends_at?: string;
  location?: string | { name: string; address?: string; lat?: number; lng?: number };
  is_public: boolean;
  slug?: string;
  public_slug?: string;
  private_slug?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/events/public", {
          headers: {
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);
        const data = await res.json();
        setEvents(data.data || data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleCreateEvent = async (eventData: EventFormData) => {
    // Backend erwartet vermutlich ein anderes Format, ggf. anpassen:
    const payload = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date + (eventData.time ? `T${eventData.time}` : ""),
      location: eventData.location_name ? `${eventData.location_name}${eventData.location_address ? ", " + eventData.location_address : ""}` : undefined,
      participant_limit: eventData.participant_limit,
      is_public: eventData.visibility === 'public',
      allow_comments: eventData.allow_comments,
    };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Always refresh events list after attempt
      const eventsRes = await fetch("http://localhost:8000/api/v1/events/public", {
        headers: {
          Accept: "application/json",
        },
      });
      let refreshedEvents = events;
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.data || data);
        refreshedEvents = data.data || data;
      }

      if (!res.ok) {
        // Try to parse backend error for validation
        let errorMsg = "Fehler beim Erstellen des Events";
        try {
          const errorData = await res.json();
          if (errorData && errorData.errors) {
            errorMsg = Object.values(errorData.errors).join(" ");
          }
        } catch {
          // Fehler beim Parsen ignorieren
        }
        // Only show error if no new event appears in the refreshed list
        if (!refreshedEvents.some((ev: Event) => ev.title === eventData.title)) {
          alert(errorMsg);
        }
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showSuccess && (
        <div className="mb-6">
          <SuccessAlert dismissible onDismiss={() => setShowSuccess(false)}>
            Event wurde erfolgreich erstellt!
          </SuccessAlert>
        </div>
      )}
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-[#e8eaf6] via-[#f5f7fa] to-[#e3f0ff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-4 tracking-tight drop-shadow-xl">Öffentliche Events</h1>
            <p className="text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Entdecke spannende Events in deiner Umgebung und werde Teil der Community.
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Lade Events...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">Fehler beim Laden der Events: {error}</p>
              </div>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Events gefunden</h3>
                <p className="text-gray-600 mb-4">
                  Aktuell sind keine öffentlichen Events verfügbar.
                </p>
                {typeof window !== "undefined" && !localStorage.getItem("token") && (
                  <Link 
                    href="/register" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Jetzt registrieren
                  </Link>
                )}
              </div>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {events
                .filter(event => {
                  const dateString = event.date;
                  if (!dateString) return false;
                  const eventDate = new Date(dateString);
                  return eventDate >= new Date();
                })
                .map((event) => {
                  const eventSlugOrId = event.public_slug || event.id;
                  return (
                  <Link
                    key={event.id}
                    href={`/events/${eventSlugOrId}`}
                    className="block bg-white/90 border border-blue-100 rounded-2xl p-8 hover:shadow-2xl transition-all cursor-pointer h-full group relative overflow-hidden"
                  >
                    <div className="absolute -top-8 -right-8 opacity-10 text-[8rem] pointer-events-none select-none group-hover:opacity-20 transition-all">
                      <Calendar className="w-[8rem] h-[8rem] text-blue-200" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:underline">
                      {event.title}
                    </h3>
                    <p className="text-lg text-gray-700 mb-6 line-clamp-3">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-base text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-2 w-5 h-5 text-blue-600 inline-block align-middle" />
                        <span>{(() => {
                          const dateString = event.starts_at || event.date;
                          if (typeof dateString === 'string') {
                            const d = new Date(dateString);
                            if (!isNaN(d.getTime())) {
                              return d.toLocaleString('de-DE', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                            } else {
                              return dateString;
                            }
                          }
                          return 'Datum unbekannt';
                        })()}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 w-5 h-5 text-blue-600 inline-block align-middle" />
                          {typeof event.location === 'object' && event.location !== null ? (
                            <span>
                              {event.location.name} <br />
                              {event.location.address ? `${event.location.address}` : ''}
                            </span>
                          ) : (
                            <span>{event.location}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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