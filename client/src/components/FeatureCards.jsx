const features = [
  {
    title: "Fast Merge",
    description:
      "Upload multiple PDF and DOCX files and combine them in seconds with stable ordering."
  },
  {
    title: "Secure Access",
    description:
      "Use account-based access with JWT sessions and encrypted passwords."
  },
  {
    title: "One-Click Download",
    description:
      "Merged file is generated on backend and downloaded directly as a PDF."
  }
];

export default function FeatureCards() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
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
