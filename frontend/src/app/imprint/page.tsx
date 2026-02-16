
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ImprintPage() {
  return (
    <>
      <Header />
        <main className="mx-auto px-6 py-12 bg-white text-black">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Impressum</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Adresse:</h2>
          <p>
            Levin Vogt<br />
            Seidenstrasse 21<br />
            8853 Lachen<br />
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Vertreten durch:</h2>
          <p>Levin Vogt</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
          <p>
            E-Mail: info@plannify.ch
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Verantwortlich für den Inhalt der Website</h2>
          <p>Levin Vogt</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Haftungsausschluss</h2>
          <h3 className="font-semibold mt-4 mb-1">Haftung für Inhalte</h3>
          <p>
            Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem schweizer Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
