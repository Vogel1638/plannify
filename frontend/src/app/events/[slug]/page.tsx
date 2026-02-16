 "use client";

import { useEffect, useState } from "react";
import {Share2,  Calendar, MapPin, Users, ClipboardList, UserCheck, AlarmClock, UserX, PencilLine, X, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

import { 
  Container, 
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle, 
  Button,
  Text,
  StatusBadge,
  EventBadge,
  Grid,
  Stack,
  ErrorAlert,
  SuccessAlert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "../../../components/ui";
import { Form, FormGroup } from "../../../components/ui/Form";
import { Input, Textarea } from "../../../components/ui/Input";
import { CreateEventModal } from "../../../components/modals/CreateEventModal";

interface Event {
  id: number;
  title: string;
  description: string;
  starts_at: string;
  ends_at?: string;
  location_name?: string;
  location_address?: string;
  location?: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  visibility: 'public' | 'private';
  participant_limit?: number;
  participant_count?: number;
  allow_comments: boolean;
  public_slug?: string;
  private_slug?: string;
  host?: {
    id: number;
    name: string;
    email: string;
  };
  participants?: Array<{
    id: number;
    name: string;
    role: string;
    status: string;
  }>;
  bring_items?: Array<{
    id: number;
    name: string;
    description?: string;
    claimed_by?: {
      id: number;
      name: string;
    };
  }>;
}

export default function EventDetailPage() {

   // Item löschen (nur Host)
  const [deleteItemLoading, setDeleteItemLoading] = useState<number | null>(null);
  const handleDeleteItem = async (itemId: number) => {
    if (!event) return;
    setDeleteItemLoading(itemId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/events/${event.id}/bring-items/${itemId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // Item direkt aus dem State entfernen
        setEvent((prev) => prev ? {
          ...prev,
          bring_items: prev.bring_items?.filter((item) => item.id !== itemId)
        } : prev);
      }
    } catch (err) {
    } finally {
      setDeleteItemLoading(null);
    }
  };
    // Funktion zum Kopieren des Einladungslinks
    const handleCopyInviteLink = async () => {
      if (!event) return;
      let inviteUrl = "";
      if (event.visibility === "public" && event.public_slug) {
        inviteUrl = `${window.location.origin}/events/${event.public_slug}`;
      } else if (event.visibility === "private" && event.private_slug) {
        // Für private Events: immer Login-Link mit Redirect und private_slug
        inviteUrl = `${window.location.origin}/login?redirect=%2Fevents%2F${event.private_slug}`;
      } else {
        setCopySuccess("Kein Einladungslink verfügbar.");
        return;
      }
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setCopySuccess("Einladungslink kopiert!");
        setTimeout(() => setCopySuccess(null), 2000);
      } catch (err) {
        setCopySuccess("Fehler beim Kopieren.");
      }
    };
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editInitialData, setEditInitialData] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Alle Mitbring-States und Handler MÜSSEN im Funktionskörper stehen:
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState<number | null>(null);
  const [unclaimLoading, setUnclaimLoading] = useState<number | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const isHost = user && event && event.host && user.id === event.host.id;

  // Item hinzufügen (nur Host)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setItemError("Name ist erforderlich.");
      return;
    }
    setItemLoading(true);
    setItemError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/events/${event?.id}/bring-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: itemName, description: itemDescription, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        setItemError(data.message || "Fehler beim Hinzufügen.");
      } else {
        setItemName("");
        setItemDescription("");
        // Neues Item direkt zur Liste hinzufügen
        const data = await res.json();
        const newItem = data.data || data;
        setEvent((prev) => prev ? {
          ...prev,
          bring_items: prev.bring_items ? [...prev.bring_items, newItem] : [newItem]
        } : prev);
      }
    } catch (err) {
      setItemError("Fehler beim Hinzufügen.");
    } finally {
      setItemLoading(false);
    }
  };

  // Item claimen
  const handleClaimItem = async (itemId: number) => {
    setClaimLoading(itemId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/events/${event?.id}/bring-items/${itemId}/claim`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // Event neu laden
        const eventRes = await fetch(`http://localhost:8000/api/v1/events/${event?.id}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData.data || eventData);
        }
      }
    } catch (err) {
      // Fehlerhandling optional
    } finally {
      setClaimLoading(null);
    }
  };

  // Item unclaimen
  const handleUnclaimItem = async (itemId: number) => {
    setUnclaimLoading(itemId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/events/${event?.id}/bring-items/${itemId}/unclaim`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // Event neu laden
        const eventRes = await fetch(`http://localhost:8000/api/v1/events/${event?.id}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData.data || eventData);
        }
      }
    } catch (err) {
      // Fehlerhandling optional
    } finally {
      setUnclaimLoading(null);
    }
  };

  // Event bearbeiten (nur Host)
  const handleEditEvent = () => {
    if (!event) return;
    // Mapping Event zu EventFormData
    setEditInitialData({
      title: event.title || "",
      description: event.description || "",
      date: event.starts_at ? event.starts_at.slice(0, 10) : "",
      time: event.starts_at ? event.starts_at.slice(11, 16) : "",
      location_name: event.location_name || "",
      location_address: event.location_address || "",
      participant_limit: event.participant_limit || 0,
      visibility: event.visibility || "public",
      allow_comments: !!event.allow_comments,
    });
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditSubmit = async (formData: any) => {
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/events/${event?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location_name: formData.location.name,
          location_address: formData.location.address,
          participant_limit: formData.participant_limit,
          visibility: formData.visibility,
          allow_comments: formData.allow_comments,
          starts_at: `${formData.date}T${formData.time || '18:00'}:00+01:00`,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.message || "Fehler beim Bearbeiten.");
      } else {
        setShowEditModal(false);
        // Event neu laden
        const eventRes = await fetch(`http://localhost:8000/api/v1/events/${event?.id}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData.data || eventData);
        }
      }
    } catch (err) {
      setEditError("Fehler beim Bearbeiten.");
    } finally {
      setEditLoading(false);
    }
  };

  // Event löschen (nur Host)
  const handleDeleteEvent = async () => {
    if (!event) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/events/${event.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.message || "Fehler beim Löschen des Events.");
      } else {
        router.push("/events");
      }
    } catch (err) {
      setDeleteError("Fehler beim Löschen des Events.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch("http://localhost:8000/api/v1/auth/me", {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
            if (res.ok) {
              const userData = await res.json();
              console.log("User Data:", userData);
              setUser(userData.data || userData);
              setIsAuthenticated(true);
               // Debug-Ausgabe für User-ID
               console.log("[DEBUG] user.id:", (userData.data || userData)?.id);
            }
        }
      } catch (err) {
        // Nicht angemeldet
      }
    }


    async function fetchEvent() {
      try {
        console.log("=== FETCHING EVENT DEBUG ===");
        console.log("Slug:", params.slug);
        let url = "";

          const token = localStorage.getItem("token");
          // Prüfe, ob params.slug wie ein privater Slug aussieht (8 Zeichen, Buchstaben/Zahlen)
          const isPrivateSlug = typeof params.slug === 'string' && /^[a-z0-9]{8}$/i.test(params.slug);
          if (isPrivateSlug) {
            url = `http://localhost:8000/api/v1/events/private/${params.slug}`;
          } else {
            url = `http://localhost:8000/api/v1/events/public/${params.slug}`;
          }
          // Für private Events immer Token mitsenden, wenn vorhanden
          const headers: HeadersInit = { Accept: "application/json" };
          if (token && isPrivateSlug) {
            headers.Authorization = `Bearer ${token}`;
          }

        console.log("API URL:", url);
        console.log("Headers:", headers);

        const res = await fetch(url, { headers });

        console.log("Response Status:", res.status);
        console.log("Response OK:", res.ok);

        if (!res.ok) {
          // Prüfe auf 403 für private Events ohne Auth
          const errorData = await res.json();
          console.log("Error Response:", errorData);

          if (res.status === 404) {
            setError("Event nicht gefunden");
          } else {
            throw new Error(`Fehler: ${res.status} - ${errorData.message || 'Unbekannter Fehler'}`);
          }
          return;
        }

        const data = await res.json();
        console.log("Event Data:", data);
        setEvent(data.data || data);
        // Setze Teilnahme-Status und Host-Status aus Meta, falls vorhanden
        if (data.meta) {
          setIsParticipating(!!data.meta.is_participant);
        }
         // Debug-Ausgaben für Event und Host
         const eventObj = data.data || data;
         console.log("[DEBUG] event.id:", eventObj?.id);
         console.log("[DEBUG] event.host:", eventObj?.host);
         console.log("[DEBUG] event.host.id:", eventObj?.host?.id);
         console.log("[DEBUG] Vollständiges eventObj:", eventObj);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
    fetchEvent();
  }, [params.slug]);

  const handleParticipate = async () => {
    if (!isAuthenticated) {
      // Aktuelle URL als redirect-Parameter anhängen
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let joinUrl = "";
      // Prüfe, ob event vorhanden ist und ob public_slug existiert
      if (event && event.public_slug) {
        joinUrl = `http://localhost:8000/api/v1/events/public/${event.public_slug}/join`;
      } else if (event && event.id) {
        joinUrl = `http://localhost:8000/api/v1/events/${event.id}/join`;
      } else {
        throw new Error("Event-Daten fehlen für Teilnahme.");
      }

      const res = await fetch(joinUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIsParticipating(true);
        setSuccessMessage("Du hast dich erfolgreich angemeldet!");
        setTimeout(() => setSuccessMessage(null), 2000);
        // Event-Daten neu laden
        let reloadUrl = "";
        if (token && !isNaN(Number(params.slug))) {
          reloadUrl = `http://localhost:8000/api/v1/events/${params.slug}`;
        } else {
          reloadUrl = `http://localhost:8000/api/v1/events/public/${params.slug}`;
        }
        const eventRes = await fetch(reloadUrl, {
          headers: {
            Accept: "application/json",
          },
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData.data || eventData);
        }
      }
    } catch (err) {
      console.error("Fehler bei der Teilnahme:", err);
    }
  };

  // Event verlassen
  const handleLeave = async () => {
    if (!isAuthenticated || !event) return;
    try {
      const token = localStorage.getItem("token");
      let leaveUrl = "";
      if (event.public_slug) {
        leaveUrl = `http://localhost:8000/api/v1/events/public/${event.public_slug}/leave`;
      } else if (event.id) {
        leaveUrl = `http://localhost:8000/api/v1/events/${event.id}/leave`;
      } else {
        throw new Error("Event-Daten fehlen für Abmeldung.");
      }
      const res = await fetch(leaveUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setIsParticipating(false);
        setSuccessMessage("Du hast dich erfolgreich abgemeldet.");
        setTimeout(() => setSuccessMessage(null), 2000);
        // Event-Daten neu laden
        let reloadUrl = "";
        if (token && !isNaN(Number(params.slug))) {
          reloadUrl = `http://localhost:8000/api/v1/events/${params.slug}`;
        } else {
          reloadUrl = `http://localhost:8000/api/v1/events/public/${params.slug}`;
        }
        const eventRes = await fetch(reloadUrl, {
          headers: {
            Accept: "application/json",
          },
        });
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData.data || eventData);
        }
      }
    } catch (err) {
      console.error("Fehler beim Verlassen des Events:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lade Event...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Event nicht gefunden</h2>
              <p className="text-red-600 mb-4">{error || "Das angeforderte Event existiert nicht."}</p>
              <Link 
                href="/events" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Zurück zu Events
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e8eaf6] via-[#f5f7fa] to-[#e3f0ff]">
      <Header />
      <main className="flex-1">
        <Container size="lg" className="py-16">
          {successMessage && (
            <div className="mb-6">
              <SuccessAlert>{successMessage}</SuccessAlert>
            </div>
          )}
          {/* Breadcrumb */}
          <nav className="mb-10">
            <ol className="flex items-center space-x-2 text-base text-blue-700 font-medium">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li>/</li>
              <li><Link href="/events" className="hover:underline">Events</Link></li>
              <li>/</li>
              <li className="text-blue-900 font-bold">{event.title}</li>
            </ol>
          </nav>

          <div className="rounded-3xl shadow-2xl bg-white/90 p-10 mb-12 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10 border border-blue-100">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 tracking-tight drop-shadow-xl">
                {event.title}
              </h1>
              <p className="text-2xl text-gray-700 mb-8 max-w-2xl">
                {event.description}
              </p>
              <div className="flex items-center gap-4 mb-8">
                <EventBadge type={event.visibility === 'public' ? 'public' : 'private'} />
              </div>
            </div>
            <div className="flex flex-col gap-4 min-w-[260px]">
              {isAuthenticated ? (
                (!isHost && !isParticipating) ? (
                  <Button
                    onClick={handleParticipate}
                    variant="primary"
                    size="lg"
                    className="text-lg py-4"
                  >
                    An Event teilnehmen
                  </Button>
                ) : (!isHost && isParticipating) ? (
                  <Button
                    onClick={handleLeave}
                    variant="outline"
                    size="lg"
                    className="text-lg py-4 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Event verlassen
                  </Button>
                ) : null
              ) : (
                <Button
                  as={Link}
                  href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                  variant="primary"
                  size="lg"
                  className="text-lg py-4"
                >
                  Anmelden um teilzunehmen
                </Button>
              )}
              {isAuthenticated && isHost && (
                <div className="flex gap-2 items-center bg-blue-50/60 rounded-xl px-3 py-2 self-start shadow-sm border border-blue-100">
                  <Button
                    onClick={handleCopyInviteLink}
                    variant="ghost"
                    size="md"
                    title="Einladungslink kopieren"
                    className="p-2.5 rounded-full hover:bg-blue-200 focus:ring-2 focus:ring-blue-400"
                    style={{ minWidth: 36, minHeight: 36 }}
                  >
                    <Share2 />
                  </Button>
                  <Button
                    onClick={handleEditEvent}
                    variant="ghost"
                    size="md"
                    title="Event bearbeiten"
                    className="p-2.5 rounded-full hover:bg-blue-200 focus:ring-2 focus:ring-blue-400"
                    style={{ minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <PencilLine />                  
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="ghost"
                    size="md"
                    title="Event löschen"
                    className="p-2.5 rounded-full hover:bg-red-100 focus:ring-2 focus:ring-red-300 text-red-600"
                    style={{ minWidth: 36, minHeight: 36 }}
                    loading={deleteLoading}
                    disabled={deleteLoading}
                  >
                    <X />
                  </Button>
                  {copySuccess && (
                    <span className="text-green-600 text-xs ml-2 whitespace-nowrap">{copySuccess}</span>
                  )}
                </div>
              )}
              <Button
                as={Link}
                href="/events"
                variant="secondary"
                size="lg"
                className="text-lg py-4"
              >
                Zurück zu Events
              </Button>
            </div>
          </div>

          <Grid cols={1} gap="lg" className="lg:grid-cols-2 gap-8 pb-8">
            {/* Linke Spalte: Event-Details */}
            <div className="flex flex-col h-full">
              <Card shadow="sm" padding="md" className="h-full">
                <CardHeader>
                  <CardTitle as="h2" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Event-Details
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-col gap-6">
                    {/* Datum & Zeit */}
                    <div className="flex items-center bg-blue-50/60 rounded-lg px-4 py-3">
                      <Calendar className="mr-4 w-7 h-7 text-blue-600" />
                      <div>
                        <Text className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Datum & Zeit</Text>
                        <Text className="font-semibold text-lg text-blue-900">
                          {new Date(event.starts_at).toLocaleDateString('de-DE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        {event.ends_at && (
                          <Text className="text-xs text-gray-500 mt-1">
                            bis {new Date(event.ends_at).toLocaleDateString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-blue-100 my-1" />
                    {/* Ort */}
                    {event.location?.name && (
                      <div className="flex items-center bg-blue-50/60 rounded-lg px-4 py-3">
                        <MapPin className="mr-4 w-7 h-7 text-blue-600" />
                        <div>
                          <Text className="text-xs text-black-700 font-semibold uppercase tracking-wide mb-1">Ort</Text>
                          <Text className="font-semibold text-lg text-blue-900">{event.location.name}</Text>
                          {event.location.address && (
                            <Text className="text-xs text-gray-500 mt-1">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location.address ? ', ' + event.location.address : ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-rose-700 transition-colors"
                              >
                                {event.location.address}
                              </a>
                            </Text>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-blue-100 my-1" />
                    {/* Teilnehmer */}
                    <div className="flex items-center bg-blue-50/60 rounded-lg px-4 py-3">
                      <Users className="mr-4 w-7 h-7 text-blue-600" />
                      <div>
                        <Text className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Teilnehmer</Text>
                        <Text className="font-semibold text-lg text-blue-900">
                          {event.participant_count || 0}
                          {event.participant_limit ? ` / ${event.participant_limit}` : ' / ∞'}
                        </Text>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

            </div>
            {/* Rechte Spalte: Teilnehmer */}
            <div className="flex flex-col h-full">
              <Card shadow="sm" padding="md" className="h-full">
                <CardHeader>
                  <CardTitle as="h2" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Teilnehmer
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {(event.participants && event.participants.length > 0) ? (
                    // Host immer oben, farblich abheben
                    <Stack spacing="sm">
                      {(() => {
                        if (!event.participants) return null;
                        const hostId = event.host?.id;
                        const sorted = [...event.participants].sort((a, b) => {
                          if (a.id === hostId) return -1;
                          if (b.id === hostId) return 1;
                          return 0;
                        });
                        return sorted.map((participant) => (
                          <div
                            key={participant.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${participant.id === hostId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div>
                              <Text className="font-medium flex items-center gap-2">
                                {participant.name}
                                {participant.id === hostId && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-semibold">Host</span>
                                )}
                              </Text>
                            </div>
                            <StatusBadge status={
                              participant.status === 'going' ? 'active' :
                              participant.status === 'pending' ? 'pending' :
                              participant.status === 'declined' ? 'inactive' : 'inactive'
                            } />
                          </div>
                        ));
                      })()}
                    </Stack>
                  ) : event.host ? (
                    <Stack spacing="sm">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Text className="font-medium flex items-center gap-2">
                            {event.host.name}
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-semibold">Host</span>
                          </Text>
                          <Text className="text-sm text-gray-500">Host</Text>
                        </div>
                        <StatusBadge status="active" />
                      </div>
                    </Stack>
                  ) : (
                    <Text className="text-gray-500 text-center py-4">
                      Noch keine Teilnehmer
                    </Text>
                  )}

                </CardBody>
              </Card>
            </div>
          </Grid>

            {/* Bring Items Section */}
            <Card shadow="sm" padding="md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle as="h2" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" /> Mitbring-Liste
                  </CardTitle>
                  {isAuthenticated && isHost && (
                    <Button size="sm" variant="primary" onClick={() => setShowAddItemModal(true)}>
                      Item hinzufügen
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {/* Modal für Item hinzufügen */}
                <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Item hinzufügen">
                  <ModalHeader onClose={() => setShowAddItemModal(false)}>Item hinzufügen</ModalHeader>
                  <ModalBody>
                    <Form onSubmit={handleAddItem}>
                      <FormGroup>
                        <Input
                          label="Name des Items"
                          value={itemName}
                          onChange={e => setItemName(e.target.value)}
                          required
                          disabled={itemLoading}
                        />
                        <Textarea
                          label="Beschreibung (optional)"
                          value={itemDescription}
                          onChange={e => setItemDescription(e.target.value)}
                          disabled={itemLoading}
                        />
                        {itemError && <ErrorAlert>{itemError}</ErrorAlert>}
                      </FormGroup>
                    </Form>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" form="add-item-form" loading={itemLoading} disabled={itemLoading} onClick={handleAddItem}>
                      Hinzufügen
                    </Button>
                  </ModalFooter>
                </Modal>
                {event.bring_items && event.bring_items.length > 0 ? (
                  <Grid cols={2} gap="md">
                    {event.bring_items.map((item) => {
                      const isClaimed = !!item.claimed_by;
                      const isMine = isAuthenticated && item.claimed_by && user && item.claimed_by.id === user.id;
                      // Teilnehmer für Dropdown (Host darf sich selbst zuweisen)
                      const assignableParticipants = event.participants || [];
                      return (
                        <Card
                          key={item.id}
                          className={`$
                            {isClaimed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                          `}
                          padding="sm"
                        >
                          <CardBody>
                            <Text className="font-medium">{item.name}</Text>
                            {item.description && (
                              <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
                            )}
                            {isClaimed ? (
                              <Text className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <UserCheck className="inline w-4 h-4" /> Wird mitgebracht von: {item.claimed_by?.name}
                              </Text>
                            ) : (
                              <Text className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                <AlarmClock className="inline w-4 h-4" /> Noch nicht vergeben
                              </Text>
                            )}
                            {/* Host: Dropdown zur Zuweisung & Löschen-Button */}
                            {isAuthenticated && isHost && (
                              <div className="mt-2 flex gap-2 items-center">
                                {assignableParticipants.length > 0 && !isClaimed && (
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      const formData = new FormData(e.target as HTMLFormElement);
                                      const userId = formData.get('assignUserId');
                                      if (!userId) return;
                                      try {
                                        const token = localStorage.getItem("token");
                                        const res = await fetch(`http://localhost:8000/api/v1/events/${event.id}/bring-items/${item.id}`, {
                                          method: "PUT",
                                          headers: {
                                            "Content-Type": "application/json",
                                            Accept: "application/json",
                                            Authorization: `Bearer ${token}`,
                                          },
                                          body: JSON.stringify({ claimed_by: userId, is_claimed: true }),
                                        });
                                        if (res.ok) {
                                          // Event neu laden
                                          const eventRes = await fetch(`http://localhost:8000/api/v1/events/${event.id}`, {
                                            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
                                          });
                                          if (eventRes.ok) {
                                            const eventData = await eventRes.json();
                                            setEvent(eventData.data || eventData);
                                          }
                                        }
                                      } catch (err) {
                                        // Fehlerhandling optional
                                      }
                                    }}
                                    className="flex gap-2 items-center"
                                  >
                                    <select
                                      name="assignUserId"
                                      className="border border-blue-200 rounded-lg px-3 py-2 text-base text-blue-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 hover:border-blue-400"
                                      style={{ minWidth: 160 }}
                                    >
                                      <option value="">Teilnehmer zuweisen…</option>
                                      {assignableParticipants.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </select>
                                    <Button type="submit" size="sm" variant="primary" className="ml-1">Zuweisen</Button>
                                  </form>
                                )}
                                <Button
                                  size="sm"
                                  variant="danger"
                                  loading={deleteItemLoading === item.id}
                                  disabled={deleteItemLoading === item.id}
                                  onClick={() => handleDeleteItem(item.id)}
                                  title="Item löschen"
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {/* Claim/Unclaim Button */}
                            {isAuthenticated && !isHost && (
                              <div className="mt-2">
                                {!isClaimed ? (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    loading={claimLoading === item.id}
                                    disabled={claimLoading === item.id}
                                    onClick={() => handleClaimItem(item.id)}
                                  >
                                    Item übernehmen
                                  </Button>
                                ) : isMine ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    loading={unclaimLoading === item.id}
                                    disabled={unclaimLoading === item.id}
                                    onClick={() => handleUnclaimItem(item.id)}
                                  >
                                    Übernahme zurückgeben
                                  </Button>
                                ) : null}
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      );
                    })}
                  </Grid>
                ) : (
                  <Text className="text-gray-500 text-center py-4">Noch keine Mitbring-Items</Text>
                )}
              </CardBody>
            </Card>
        </Container>
      </main>
      <Footer />
      {/* Edit Event Modal (reused CreateEventModal) */}
      <CreateEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        initialData={editInitialData}
        loading={editLoading}
        error={editError}
        editMode={true}
      />
      {/* Delete Event Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Event löschen">
        <ModalHeader onClose={() => setShowDeleteConfirm(false)}>Event löschen</ModalHeader>
        <ModalBody>
          <p className="text-black">Möchtest du dieses Event wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
          {deleteError && <ErrorAlert>{deleteError}</ErrorAlert>}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent} loading={deleteLoading} disabled={deleteLoading}>
            Event löschen
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
