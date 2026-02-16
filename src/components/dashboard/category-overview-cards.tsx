import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Building, Briefcase, ArrowRight } from "lucide-react";
import type { TicketCategory } from "@/lib/types";

interface CategoryOverviewCardsProps {
  stats: Record<TicketCategory, { total: number; new: number }>;
}

const categoryCards: {
  key: TicketCategory;
  label: string;
  slug: string;
  icon: typeof MessageSquare;
  accent: string;
  bg: string;
}[] = [
  {
    key: "contact_us",
    label: "Contact Us",
    slug: "contact-us",
    icon: MessageSquare,
    accent: "text-cyan-400",
    bg: "bg-cyan-500/15",
  },
  {
    key: "property_tokenization",
    label: "Property Tokenization",
    slug: "property-tokenization",
    icon: Building,
    accent: "text-orange-400",
    bg: "bg-orange-500/15",
  },
  {
    key: "job_application",
    label: "Job Applicants",
    slug: "job-applicants",
    icon: Briefcase,
    accent: "text-purple-400",
    bg: "bg-purple-500/15",
  },
];

export function CategoryOverviewCards({ stats }: CategoryOverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {categoryCards.map((cat) => {
        const s = stats[cat.key];
        return (
          <Link key={cat.key} href={`/${cat.slug}`}>
            <Card className="group transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.bg}`}
                >
                  <cat.icon className={`h-5 w-5 ${cat.accent}`} />
                </div>
                <CardTitle className="text-base font-semibold">
                  {cat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-4">
                    <div>
                      <p className="text-3xl font-bold">{s.total}</p>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>
                    {s.new > 0 && (
                      <div>
                        <p className={`text-xl font-semibold ${cat.accent}`}>
                          {s.new}
                        </p>
                        <p className="text-xs text-muted-foreground">new</p>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
