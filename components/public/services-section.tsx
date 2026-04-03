import { GenericSectionWithItems } from "@/lib/queries";

type ServicesSectionProps = {
  data: GenericSectionWithItems;
};

export function ServicesSection({ data }: ServicesSectionProps) {
  return (
    <section id="dich-vu" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{data.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{data.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {data.items.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
