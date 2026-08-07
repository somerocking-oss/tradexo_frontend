"use client";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Globe,
  Layers,
  Mail,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { CmsPage, SiteSettings } from "@/lib/cms";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

const AD_PRODUCTS = [
  {
    icon: Star,
    title: "Featured listings",
    hint: "Top placement in search & category pages",
    bullets: ["Priority ranking", "Featured badge", "More profile views"],
  },
  {
    icon: MapPin,
    title: "City promotions",
    hint: "Dominate your local market",
    bullets: ["City homepage slots", "Near-me visibility", "Local buyer alerts"],
  },
  {
    icon: Layers,
    title: "Category sponsorship",
    hint: "Own your category on the platform",
    bullets: ["Category banner", "Sponsored tag", "Lead priority"],
  },
  {
    icon: Globe,
    title: "Banner advertising",
    hint: "High-impact brand visibility",
    bullets: ["Homepage banners", "Browse page slots", "Custom creatives"],
  },
] as const;

const STEPS = [
  { step: "1", title: "Choose a package", desc: "Pick self-serve plans or request a custom media kit." },
  { step: "2", title: "Target your audience", desc: "Select city, category, and business goals." },
  { step: "3", title: "Go live & track leads", desc: "Monitor views, calls, and enquiries from your dashboard." },
] as const;

const BENEFITS = [
  "Buyers with high purchase intent",
  "Verified business ecosystem",
  "Call, WhatsApp & RFQ leads",
  "Transparent performance tracking",
  "Flexible city & category targeting",
  "Dedicated account support for brands",
] as const;

function CmsBody({ body }: { body?: string }) {
  if (!body?.trim()) return null;

  if (body.includes("<") && body.includes(">")) {
    return (
      <div
        className="cms-content space-y-4 leading-relaxed text-neutral-600 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_p]:mt-2"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(body) }}
      />
    );
  }

  return <p className="whitespace-pre-line leading-relaxed text-neutral-600">{body}</p>;
}

interface AdvertiseContentProps {
  page: CmsPage | null;
  settings: SiteSettings | null;
}

export function AdvertiseContent({ page, settings }: AdvertiseContentProps) {
  const adsEmail = settings?.adsEmail || "ads@Tradexo.com";

  return (
    <div className="bg-neutral-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Ad products */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Advertising solutions
              </h2>
              <p className="mt-1.5 text-sm text-neutral-500">
                Packages for single-location shops to multi-city B2B brands
              </p>
            </div>
            <Button href="/plans" variant="outline" size="sm">
              View self-serve plans
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {AD_PRODUCTS.map(({ icon: Icon, title, hint, bullets }) => (
              <Card
                key={title}
                className="border-neutral-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6C00]/20 hover:shadow-md"
              >
                <CardBody className="p-6 sm:p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E5E5E5]">
                    <Icon className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-neutral-900">{title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{hint}</p>
                  <ul className="mt-5 space-y-2.5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-neutral-600">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works + Contact */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* How it works */}
          <section className="lg:col-span-2">
            <Card className="h-full border-neutral-100 shadow-sm">
              <CardBody className="p-6 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E5E5E5]">
                    <BarChart3 className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                  </span>
                  <h2 className="text-xl font-bold text-neutral-900">How it works</h2>
                </div>

                <ol className="mt-7 space-y-6">
                  {STEPS.map(({ step, title, desc }) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6C00] text-sm font-bold text-white">
                        {step}
                      </span>
                      <div className="pt-1.5">
                        <p className="font-semibold text-neutral-900">{title}</p>
                        <p className="mt-1 text-sm text-neutral-500">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Benefits grid */}
                <div className="mt-9">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Sparkles className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                    Why advertisers choose us
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {BENEFITS.map((b) => (
                      <div
                        key={b}
                        className="flex items-center gap-2.5 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF6C00]" aria-hidden />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Contact CTA */}
          <aside>
            <Card className="sticky top-24 border-[#D4D4D4] bg-gradient-to-br from-[#F0F0F0] to-white shadow-md">
              <CardBody className="p-6 sm:p-7">
                <h2 className="text-xl font-bold text-neutral-900">Get a media kit</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  Tell us your city, category, and monthly budget. Our sales team will share
                  tailored packages and creatives.
                </p>

                <a
                  href={`mailto:${adsEmail}?subject=Advertising%20enquiry%20-%20Tradexo`}
                  className="mt-5 flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 transition-all duration-200 hover:border-[#FF6C00]/30 hover:shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FF6C00] text-white">
                    <Mail className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                      Sales team
                    </p>
                    <p className="truncate text-sm font-semibold text-neutral-900">{adsEmail}</p>
                  </div>
                </a>

                <div className="mt-5 space-y-2.5">
                  <Button href="/register-business" className="w-full">
                    <Building2 className="h-4 w-4" aria-hidden />
                    Start with free listing
                  </Button>
                  <Button href="/plans" variant="outline" className="w-full">
                    Compare premium plans
                  </Button>
                </div>

                <p className="mt-4 text-center text-xs text-neutral-400">
                  Response within 1–2 business days
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>

        {/* CMS body */}
        {page?.body && (
          <Card className="border-neutral-100 shadow-sm">
            <CardBody className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-neutral-900">More about advertising</h2>
              <div className="mt-5">
                <CmsBody body={page.body} />
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
