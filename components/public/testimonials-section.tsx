import { TestimonialData } from "@/lib/queries";

type TestimonialsSectionProps = {
  data: TestimonialData;
};

function renderStars(rating: number) {
  const clamped = Math.max(1, Math.min(5, rating));
  return "★".repeat(clamped);
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  return (
    <section id="danh-gia" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{data.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{data.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {data.items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-amber-500">{renderStars(item.rating)}</p>
            <p className="mt-2 text-sm text-slate-700">“{item.content}”</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">{item.customerName}</p>
            <p className="text-xs text-slate-500">
              {[item.location, item.serviceName].filter(Boolean).join(" • ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
