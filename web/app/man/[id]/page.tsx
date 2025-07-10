import { notFound } from "next/navigation";
import { getManPage } from "../../manPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

function sanitizeManPageContent(content: string): string {
  // Remove html, head, body tags and extract only the content
  return content
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .trim();
}

export default async function ManPageView({ params }: PageProps) {
  const param = await params;
  const content = await getManPage(param.id);

  if (!content) {
    notFound();
  }

  const sanitizedContent = sanitizeManPageContent(content);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{ fontFamily: "monospace", fontSize: "14px", lineHeight: "1.5" }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
}
