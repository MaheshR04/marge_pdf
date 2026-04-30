const features = [
  {
    title: "Fast Merge",
    description:
      "Upload PDFs, DOCX files, and photos, then combine them in seconds with stable ordering."
  },
  {
    title: "Convert PDF",
    description:
      "Convert a single supported file into PDF or Word without needing a second upload."
  },
  {
    title: "Secure Access",
    description:
      "Use account-based access with JWT sessions and encrypted passwords."
  },
  {
    title: "One-Click Download",
    description:
      "Merged or converted file is generated on backend and downloaded directly as PDF or Word."
  }
];

export default function FeatureCards() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-4 md:grid-cols-4">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="glass animate-fade-up rounded-2xl border border-white/40 p-5 shadow-soft"
          >
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
