import Link from "next/link";
import type { ReactNode } from "react";
import type { PortableTextBlock, PortableTextSpan } from "@/types/content";

/**
 * Minimal, safe renderer for the Portable Text subset used by fixtures.
 * Unknown styles/marks degrade to plain text; links accept internal paths and
 * http(s)/mailto only. Swap for @portabletext/react at Sanity integration.
 */
function safeHref(href: string) {
  return /^(\/(?!\/)|https?:\/\/|mailto:)/i.test(href) ? href : null;
}

function renderSpan(span: PortableTextSpan, block: PortableTextBlock): ReactNode {
  let node: ReactNode = span.text;
  for (const mark of span.marks ?? []) {
    if (mark === "strong") node = <strong className="font-semibold text-[var(--color-navy)]">{node}</strong>;
    else if (mark === "em") node = <em>{node}</em>;
    else {
      const definition = block.markDefs?.find((def) => def._key === mark);
      const href = definition ? safeHref(definition.href) : null;
      if (href) node = <Link href={href} className="font-semibold text-[var(--color-blue)]">{node}</Link>;
    }
  }
  return <span key={span._key}>{node}</span>;
}

function renderBlock(block: PortableTextBlock) {
  const children = block.children.map((span) => renderSpan(span, block));
  switch (block.style) {
    case "h2":
      return <h2 key={block._key} className="mt-12 text-[clamp(24px,2.2vw,32px)] leading-[1.15] font-bold tracking-[-.02em] text-[var(--color-navy)] text-balance first:mt-0">{children}</h2>;
    case "h3":
      return <h3 key={block._key} className="mt-9 text-[21px] leading-snug font-bold text-[var(--color-navy)]">{children}</h3>;
    case "blockquote":
      return <blockquote key={block._key} className="mt-7 border-l-2 border-[var(--color-blue)] pl-6 text-xl text-[var(--color-navy)]">{children}</blockquote>;
    default:
      return <p key={block._key} className="mt-5 first:mt-0">{children}</p>;
  }
}

export default function PortableTextBody({ blocks }: { blocks: PortableTextBlock[] }) {
  const output: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (!block.listItem) {
      output.push(renderBlock(block));
      continue;
    }
    // Group consecutive list items of the same type.
    const items: PortableTextBlock[] = [];
    while (i < blocks.length && blocks[i].listItem === block.listItem) items.push(blocks[i++]);
    i -= 1;
    const List = block.listItem === "number" ? "ol" : "ul";
    output.push(
      <List key={block._key} className={`mt-5 grid gap-2 pl-6 ${List === "ol" ? "list-decimal" : "list-disc"} marker:text-[var(--color-blue)]`}>
        {items.map((item) => (
          <li key={item._key} className="pl-1">{item.children.map((span) => renderSpan(span, item))}</li>
        ))}
      </List>,
    );
  }
  return <div className="text-[18px] leading-[1.7] text-[var(--color-copy)]">{output}</div>;
}
