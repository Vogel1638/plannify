import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#e8eaf6] via-[#f5f7fa] to-[#e3f0ff] border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-500 text-sm">
            © 2026 Plannify. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-6">
            <Link href="/dsg" className="text-blue-500 hover:text-blue-900 text-sm transition">
              Datenschutzerklärung
            </Link>
            <Link href="/imprint" className="text-blue-500 hover:text-blue-900 text-sm transition">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
