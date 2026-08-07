import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { CmsPage, SiteSettings } from "@/lib/cms";
import { SITE_NAME } from "@/lib/constants";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    desc: "Verified profiles, transparent listings, and tools to report misuse.",
  },
  {
    icon: Target,
    title: "Lead-driven",
    desc: "Every feature is designed to turn searches into real calls and enquiries.",
  },
  {
    icon: MapPin,
    title: "Local + B2B",
    desc: "From neighbourhood services to pan-India suppliers — one platform.",
  },
  {
    icon: Zap,
    title: "Modern & fast",
    desc: "Mobile-friendly discovery, RFQs, chat, and dashboards built for today.",
  },
] as const;

const BUYER_STEPS = [
  "Search by city, category, or keyword",
  "Compare businesses, reviews & quotes",
  "Call, WhatsApp, or post an RFQ",
] as const;

const SELLER_STEPS = [
  "Register your business for free",
  "Complete profile, KYC & photos",
  "Receive leads in your dashboard",
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

interface AboutContentProps {
  page: CmsPage | null;
  settings: SiteSettings | null;
}

export function AboutContent({ page, settings }: AboutContentProps) {
  const siteName = settings?.siteName || SITE_NAME;
  const stats = settings?.footer?.stats?.length
    ? settings.footer.stats
    : [
        { value: "1.2L+", label: "Businesses" },
        { value: "400+", label: "Cities" },
      ];

  return (
    <div className="bg-neutral-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={`${stat.label}-${i}`}
              className="rounded-xl border border-neutral-100 bg-white px-6 py-5 text-center shadow-sm transition-all duration-200 hover:border-[#FF6C00]/20 hover:shadow-md"
            >
              <p className="text-3xl font-extrabold tracking-tight text-[#FF6C00]">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-neutral-400">{stat.label}</p>
            </div>
          ))}
          <div className="rounded-xl border border-[#D4D4D4] bg-gradient-to-br from-[#F0F0F0] to-white px-6 py-5 text-center shadow-sm sm:col-span-2 lg:col-span-2">
            <p className="text-lg font-bold text-neutral-900">One platform, two sides</p>
            <p className="mt-1 text-sm text-neutral-500">
              Buyers find suppliers · Sellers get qualified leads
            </p>
          </div>
        </div>

        {/* Mission */}
        <Card className="border-neutral-100 shadow-sm">
          <CardBody className="p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#E5E5E5] px-3 py-1 text-xs font-semibold text-[#FF6C00]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Our mission
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  Simplifying how India finds businesses
                </h2>
                <p className="mt-4 leading-relaxed text-neutral-600">
                  {siteName} exists to simplify how India discovers and connects with businesses.
                  Whether you need a plumber in your neighbourhood or a bulk supplier for your
                  factory, we help you find the right match — with verified information, direct
                  contact, and zero middlemen friction.
                </p>
                <p className="mt-4 leading-relaxed text-neutral-600">
                  For sellers, we provide free listings, lead dashboards, RFQ access, and premium
                  tools to grow visibility in the cities and categories that matter most.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {VALUES.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="group rounded-xl border border-neutral-100 bg-neutral-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6C00]/20 hover:bg-white hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5E5E5]">
                      <Icon className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                    </span>
                    <p className="mt-3 font-semibold text-neutral-900">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* For buyers & sellers */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-neutral-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardBody className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5E5E5]">
                  <ShoppingBag className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">For buyers</h2>
                  <p className="text-sm text-neutral-500">Find trusted suppliers near you</p>
                </div>
              </div>
              <ol className="mt-6 space-y-4">
                {BUYER_STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF6C00] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-neutral-600">{step}</span>
                  </li>
                ))}
              </ol>
              <Button href="/listings" variant="outline" size="sm" className="mt-7">
                <Search className="h-4 w-4" aria-hidden />
                Browse listings
              </Button>
            </CardBody>
          </Card>

          <Card className="border-neutral-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardBody className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5E5E5]">
                  <Building2 className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">For sellers</h2>
                  <p className="text-sm text-neutral-500">Get calls, WhatsApp &amp; RFQ leads</p>
                </div>
              </div>
              <ol className="mt-6 space-y-4">
                {SELLER_STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF6C00] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-neutral-600">{step}</span>
                  </li>
                ))}
              </ol>
              <Button href="/register-business" size="sm" className="mt-7">
                <Building2 className="h-4 w-4" aria-hidden />
                Register business
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Why choose us */}
        <Card className="overflow-hidden border-neutral-100 shadow-sm">
          <CardBody className="p-0">
            <div className="grid lg:grid-cols-2">
              {/* Brand side */}
              <div className="bg-gradient-to-br from-[#FF6C00] to-[#E86200] p-8 text-white sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Handshake className="h-6 w-6" aria-hidden />
                </span>
                <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Why {siteName}?</h2>
                <p className="mt-3 leading-relaxed text-white/85">
                  We combine the reach of a national marketplace with the relevance of local
                  search — so every enquiry counts.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    "Free business listings to get started",
                    "RFQ marketplace for bulk & B2B buyers",
                    "Verified badges & profile completeness scores",
                    "Lead analytics for sellers",
                    "City & category SEO-friendly pages",
                    "Dedicated support & advertising options",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-white/80" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* White side */}
              <div className="flex flex-col justify-center gap-6 bg-white p-8 sm:p-10">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E5E5E5]">
                    <TrendingUp className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">Growing every day</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      New businesses and buyers join across hundreds of cities.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button href="/post-requirement" variant="outline" size="sm">
                    Post requirement
                  </Button>
                  <Button href="/plans" variant="outline" size="sm">
                    Premium plans
                  </Button>
                  <Button href="/page/advertise" variant="outline" size="sm">
                    Advertise
                  </Button>
                </div>

                <Link
                  href="/support"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6C00] transition-colors hover:text-[#E86200]"
                >
                  Contact our team
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* CMS body */}
        {page?.body && (
          <Card className="border-neutral-100 shadow-sm">
            <CardBody className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-neutral-900">More about us</h2>
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
