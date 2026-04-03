import { FaqData } from "@/lib/queries";

type FaqSectionProps = {
  data: FaqData;
};

export function FaqSection({ data }: FaqSectionProps) {
  return (
    <section id="faq" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{data.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{data.description}</p>
      <div className="mt-4 space-y-2">
        {data.items.map((item) => (
          <details key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
            <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
