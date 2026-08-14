import { createFileRoute } from "@tanstack/react-router";
import { PlayCircle, FileText, ExternalLink, Film } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media Library — Jala Rakshana" },
      { name: "description", content: "Curated videos and guides on water conservation and rainwater harvesting." },
    ],
  }),
  component: MediaPage,
});

const VIDEOS = [
  { title: "Why Water Conservation Matters", src: "https://www.youtube.com/embed/OrxmbSjOtaU" },
  { title: "How Rainwater Harvesting Works", src: "https://www.youtube.com/embed/tKZuUXQg9tk" },
  { title: "Jal Jeevan Mission — Explained", src: "https://www.youtube.com/embed/tHi3XKfSqA0" },
];

const GUIDES = [
  { title: "Rooftop Rainwater Harvesting Manual (CGWB)", url: "https://cgwb.gov.in/documents/RTRWH-Manual.pdf" },
  { title: "Jal Jeevan Mission — Operational Guidelines", url: "https://jaljeevanmission.gov.in/" },
  { title: "Atal Bhujal Yojana", url: "https://ataljal.mowr.gov.in/" },
  { title: "National Water Mission", url: "https://nwm.gov.in/" },
];

function MediaPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("media_title")} subtitle={t("media_sub")} icon={Film} />
      <main className="px-4 py-5 space-y-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">{t("videos")}</h2>
          <div className="space-y-3">
            {VIDEOS.map((v) => (
              <div key={v.src} className="glass rounded-3xl overflow-hidden">
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={v.src}
                    title={v.title}
                    className="w-full h-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 flex items-center gap-2 text-sm">
                  <PlayCircle className="size-4 text-primary" />
                  <span className="font-medium">{v.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">{t("guides")}</h2>
          <div className="space-y-2">
            {GUIDES.map((g) => (
              <a
                key={g.url}
                href={g.url}
                target="_blank"
                rel="noreferrer"
                className="glass rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition"
              >
                <FileText className="size-5 text-primary" />
                <span className="flex-1 text-sm font-medium">{g.title}</span>
                <ExternalLink className="size-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
