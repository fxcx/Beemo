import type { BlogBlock } from "@/lib/blog-types";
import Link from "next/link";

export function BlogRichContent({ blocks }: { blocks: BlogBlock[] }) {
  return blocks.map((block, index) => {
    const key = `${block.type}-${index}`;

    switch (block.type) {
      case "paragraph":
        return <p key={key} className="text-base leading-8 text-ink-soft">{block.text}</p>;
      case "links":
        return <p key={key} className="text-base leading-8 text-ink-soft">{block.lead}{" "}{block.items.map((item, itemIndex) => <span key={item.href}>{itemIndex > 0 ? ", " : null}<Link href={item.href} className="font-semibold text-brand-deep underline decoration-brand/50 underline-offset-4 hover:decoration-brand">{item.label}</Link></span>)}.</p>;
      case "list":
        return (
          <div key={key} className="space-y-3">
            {block.title ? <h3 className="font-display text-lg font-semibold">{block.title}</h3> : null}
            <ul className="grid gap-3">
              {block.items.map((item) => <li key={item} className="flex items-start gap-3 text-base leading-7 text-ink-soft"><span className="mt-2 size-2 shrink-0 rounded-full bg-brand-deep" />{item}</li>)}
            </ul>
          </div>
        );
      case "table":
        return (
          <div key={key} className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-xl border-collapse text-left text-sm">
              <thead className="bg-surface text-ink"><tr>{block.headers.map((header) => <th key={header} scope="col" className="border-b border-line px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
              <tbody>{block.rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="odd:bg-white even:bg-surface/60">{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`} className="border-b border-line/70 px-4 py-3 leading-6 text-ink-soft last:border-0">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      case "callout":
        return <aside key={key} className="rounded-2xl border-l-4 border-brand bg-brand-soft p-5 sm:p-6"><h3 className="font-display text-lg font-semibold">{block.title}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{block.body}</p></aside>;
      case "formula":
        return (
          <div key={key} className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-ink p-5 text-center text-sm font-semibold text-white sm:gap-3 sm:p-7">
            {block.items.map((item, itemIndex) => <span key={item} className="contents"><span className={itemIndex === block.items.length - 1 ? "text-brand" : ""}>{item}</span>{itemIndex < block.items.length - 1 ? <span aria-hidden="true" className="text-brand">+</span> : null}</span>)}
          </div>
        );
      case "diagram":
        return (
          <figure key={key} className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
            <figcaption className="text-sm font-semibold text-muted">{block.title}</figcaption>
            <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
              {block.items.map((item, itemIndex) => <div key={item} className="contents"><span className="rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-semibold">{item}</span>{itemIndex < block.items.length - 1 ? <span aria-hidden="true" className="text-center font-bold text-brand-deep sm:px-1">{itemIndex === 0 || itemIndex === 2 ? "↓" : "→"}</span> : null}</div>)}
            </div>
          </figure>
        );
      case "faq":
        return (
          <div key={key} className="grid gap-3">
            {block.items.map(({ question, answer }) => <details key={question} className="group rounded-2xl border border-line bg-white px-5 py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-ink marker:hidden">{question}<span aria-hidden="true" className="float-right text-brand-deep transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-7 text-muted">{answer}</p></details>)}
          </div>
        );
    }
  });
}