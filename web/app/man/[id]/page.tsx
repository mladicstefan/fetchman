"use client";

import { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Search,
  Moon,
  Sun,
  Terminal,
  FileText,
  Menu,
  X,
  ChevronRight,
  Hash,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ManPage({ params }: PageProps) {
  const { id } = use(params);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDarkMode(isDark);
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      newTheme ? "dark" : "light",
    );
  };

  // Load markdown content
  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/man?id=${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load man page");
        }

        const data = await response.json();
        setMarkdown(data.content);
        setError(null);

        // Generate table of contents
        generateToc(data.content);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load man page",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [id]);

  // Generate table of contents
  const generateToc = (content: string) => {
    const lines = content.split("\n");
    const tocItems: TocItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        tocItems.push({ id, text, level });
      }
    });

    setToc(tocItems);
  };

  // Handle scroll to update active heading
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const scrollTop = window.scrollY + 100;

      let current = "";
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top + window.scrollY <= scrollTop) {
          current = heading.id;
        }
      });

      setActiveHeading(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter markdown content
  const filteredMarkdown = searchTerm
    ? markdown
        .split("\n")
        .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join("\n")
    : markdown;

  // Scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading <span className="font-mono text-primary">{id}</span> manual
            page...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center mb-4 mx-auto">
            <FileText className="h-8 w-8 text-destructive-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg mb-2 text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground">
            Make sure{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">{id}.md</code>{" "}
            exists in the cache directory
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="doc-header">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-accent"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-primary text-primary-foreground">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground m-0 border-none p-0">
                  {id}
                </h1>
                <p className="text-sm text-muted-foreground">Manual Page</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`doc-sidebar ${sidebarOpen ? "open" : ""} lg:block ${sidebarOpen ? "block" : "hidden"}`}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                    activeHeading === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                >
                  <div className="flex items-center space-x-2">
                    <Hash className="h-3 w-3" />
                    <span className="truncate">{item.text}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="doc-main">
          <div className="doc-content">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => {
                    const text = children?.toString() || "";
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "");
                    return (
                      <h1
                        id={id}
                        className="group scroll-mt-20 flex items-center space-x-2 cursor-pointer"
                        onClick={() => scrollToHeading(id)}
                      >
                        <span>{children}</span>
                        <Hash className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h1>
                    );
                  },
                  h2: ({ children }) => {
                    const text = children?.toString() || "";
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "");
                    return (
                      <h2
                        id={id}
                        className="group scroll-mt-20 flex items-center space-x-2 cursor-pointer"
                        onClick={() => scrollToHeading(id)}
                      >
                        <span>{children}</span>
                        <Hash className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const text = children?.toString() || "";
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "");
                    return (
                      <h3
                        id={id}
                        className="group scroll-mt-20 flex items-center space-x-2 cursor-pointer"
                        onClick={() => scrollToHeading(id)}
                      >
                        <span>{children}</span>
                        <Hash className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    );
                  },
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "text";

                    if (!inline) {
                      return (
                        <div className="relative group my-4">
                          <SyntaxHighlighter
                            style={isDarkMode ? oneDark : oneLight}
                            language={language}
                            PreTag="div"
                            customStyle={{
                              background: isDarkMode ? "#1e293b" : "#f8fafc",
                              border: isDarkMode
                                ? "1px solid #334155"
                                : "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "1rem",
                              fontSize: "0.875rem",
                              lineHeight: "1.7",
                              margin: 0,
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code
                        className="bg-muted px-2 py-1 rounded text-sm font-mono border border-border"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-2">
                      {children}
                    </td>
                  ),
                }}
              >
                {filteredMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
