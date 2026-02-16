
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Calendar, Users, ListTodo } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-[#e8eaf6] via-[#f5f7fa] to-[#e3f0ff] min-h-[calc(100vh-80px)] flex items-center justify-center"
          style={{ minHeight: 'calc(100vh - 80px)' }}
        >
          {/* Animierter Hintergrund */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-70 z-0" aria-hidden="true">
            <svg className="w-full h-full animate-pulse-slow" viewBox="0 0 1440 320" fill="none"><path fill="#a5b4fc" fillOpacity="0.13" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
            <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-blob1"></div>
            <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-blob2"></div>
          </div>
          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center py-24 md:py-40">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 drop-shadow-xl animate-fade-in-up">Plannify</h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-12 animate-fade-in-up delay-100 max-w-2xl mx-auto">Die einzigartige, sichere und moderne Lösung für Event-Planung und Organisation. Vertraue auf Innovation, Datenschutz und Stil.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200 mb-8">
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-700 to-purple-600 text-white px-12 py-5 rounded-full text-xl font-bold shadow-xl hover:scale-105 hover:from-blue-800 hover:to-purple-700 transition-all duration-200 border-2 border-transparent"
              >
                Jetzt starten
              </Link>
              <Link 
                href="/events" 
                className="bg-white/90 border-2 border-blue-200 text-blue-900 px-12 py-5 rounded-full text-xl font-bold shadow-xl hover:bg-blue-50 hover:text-blue-800 transition-all duration-200"
              >
                Events ansehen
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Warum Plannify?</h2>
              <p className="text-2xl text-gray-600">Alles, was du für die perfekte Event-Planung brauchst</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-md hover:scale-105 transition-transform duration-300">
                <div className="bg-blue-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Calendar className="text-blue-700 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Event-Erstellung</h3>
                <p className="text-lg text-gray-600">Erstelle Events mit allen wichtigen Details – schnell, intuitiv und modern.</p>
              </div>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:scale-105 transition-transform duration-300">
                <div className="bg-green-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Users className="text-green-700 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Gäste-Verwaltung</h3>
                <p className="text-lg text-gray-600">Lade Gäste ein, verwalte Einladungen und behalte alles im Blick.</p>
              </div>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 shadow-md hover:scale-105 transition-transform duration-300">
                <div className="bg-purple-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <ListTodo className="text-purple-700 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Mitbring-Listen</h3>
                <p className="text-lg text-gray-600">Organisiere, was mitgebracht werden soll und wer was übernimmt.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
            <div className="flex flex-col items-center">
              <img src="/avatar-testimonial.png" alt="Kundin" className="w-24 h-24 rounded-full mb-6 shadow-lg border-4 border-white" />
              <blockquote className="text-2xl md:text-3xl text-gray-700 font-light mb-6 italic max-w-2xl">“Plannify hat unsere Event-Organisation revolutioniert. Noch nie war es so einfach, alles im Griff zu haben!”</blockquote>
              <span className="text-lg font-semibold text-gray-900">Anna Müller</span>
              <span className="text-gray-500">Eventmanagerin, EventX</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">Häufige Fragen</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ist Plannify kostenlos?</h3>
                <p className="text-gray-600 text-lg">Ja, die Basisfunktionen sind komplett kostenlos nutzbar. Für Teams und Unternehmen gibt es optionale Premium-Features.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Kann ich Gäste ohne Account einladen?</h3>
                <p className="text-gray-600 text-lg">Das ist derzeit noch nicht möglich. Gäste müssen sich registrieren, um an Events teilzunehmen.</p> </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Wie sicher sind meine Daten?</h3>
                <p className="text-gray-600 text-lg">Deine Daten werden verschlüsselt übertragen und sicher gespeichert. Wir legen großen Wert auf Datenschutz.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#f5f7fa] to-[#e3f0ff] py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Bereit loszulegen?</h2>
            <p className="text-2xl text-gray-600 mb-10">Erstelle dein erstes Event und erlebe, wie einfach Planung sein kann.</p>
            <Link 
              href="/register" 
              className="bg-black/90 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-black transition-colors duration-200 inline-block"
            >
              Kostenlos registrieren
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
