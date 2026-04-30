import Navbar from "./components/Navbar";
import MergePanel from "./components/MergePanel";
import FeatureCards from "./components/FeatureCards";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
          <div className="hero-entry max-w-3xl">
            <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
              PDF Utility
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              Merge files and photos with reliable downloads
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Register or login, upload your PDFs, Word files, and photos, then
              generate a final PDF or Word file in a single click.
            </p>
          </div>
        </section>

        <MergePanel />
        <FeatureCards />
      </main>

      <Footer />
    </div>
  );
}
