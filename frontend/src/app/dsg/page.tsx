
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function DSGPage() {
	return (
		<>
			<Header />
			<main className="mx-auto px-6 py-12 bg-white shadow-md text-black">
				<h1 className="text-3xl font-bold mb-8 text-blue-900">Datenschutzerklärung</h1>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">1. Allgemeine Hinweise</h2>
					<p>
						Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir bearbeiten Ihre Daten daher ausschliesslich auf Grundlage der gesetzlichen Bestimmungen (DSG, DSGVO, TMG).
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">2. Verantwortliche Stelle</h2>
					<p>
						Levin Vogt<br />
						Seidenstrasse 21<br />
						8853 Lachen<br />
						Schweiz<br />
						E-Mail: info@plannify.ch
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">3. Erhebung und Bearbeitung von Personendaten</h2>
					<p>
						Wir bearbeiten Personendaten, die Sie uns freiwillig zur Verfügung stellen (z.B. bei der Registrierung oder Nutzung unserer Dienste) sowie Daten, die automatisch beim Besuch der Website erfasst werden (z.B. IP-Adresse, Browserinformationen).
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">4. Zweck der Datenbearbeitung</h2>
					<p>
						Die Bearbeitung Ihrer Daten erfolgt zur Bereitstellung und Verbesserung unseres Angebots, zur Kommunikation mit Ihnen, zur Sicherheit sowie zur Einhaltung gesetzlicher Pflichten.
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">5. Weitergabe von Daten</h2>
					<p>
						Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, wenn dies zur Vertragserfüllung notwendig ist, wir gesetzlich dazu verpflichtet sind oder Sie ausdrücklich eingewilligt haben.
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">6. Ihre Rechte</h2>
					<p>
						Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Bearbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Bearbeitung Ihrer Personendaten. Kontaktieren Sie uns dazu unter den oben angegebenen Kontaktdaten.
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">7. Datensicherheit</h2>
					<p>
						Wir treffen angemessene technische und organisatorische Sicherheitsmassnahmen, um Ihre Personendaten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen.
					</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">8. Änderungen</h2>
					<p>
						Wir behalten uns vor, diese Datenschutzerklärung jederzeit zu ändern. Es gilt die jeweils aktuelle, auf dieser Website publizierte Version.
					</p>
				</section>
			</main>
			<Footer />
		</>
	);
}
