import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { buildCmsMetadata, fetchCmsPage } from "@/lib/cms";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage("privacy");
  return buildCmsMetadata(page, {
    title: "Privacy Policy",
    description: "How Tradexo collects, uses, and protects your data.",
  });
}

const TOC_SECTIONS = [
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use", label: "How we use it" },
  { id: "sharing", label: "Sharing & disclosure" },
  { id: "cookies", label: "Cookies" },
  { id: "security", label: "Data security" },
  { id: "your-rights", label: "Your rights" },
  { id: "children", label: "Children's privacy" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
] as const;

const FALLBACK_SECTIONS: { id: string; heading: string; body: string }[] = [
  {
    id: "information-we-collect",
    heading: "Information we collect",
    body: "We collect information you provide directly when creating an account or listing, including your name, phone number, email address, business details, and location. We also collect information automatically when you use Tradexo, such as IP addresses, device identifiers, browser type, and pages visited.",
  },
  {
    id: "how-we-use",
    heading: "How we use it",
    body: "We use your information to operate and improve the platform, send you leads and enquiry notifications, process payments, prevent fraud and abuse, and send service communications. With your consent, we may also send promotional messages about features and partner offers.",
  },
  {
    id: "sharing",
    heading: "Sharing & disclosure",
    body: "We share your contact details with buyers or sellers as part of normal marketplace transactions. We do not sell your personal data to third parties. We may share data with service providers who help us run Tradexo (payment processors, SMS gateways, cloud providers) under strict data-processing agreements.",
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: "We use strictly necessary cookies to keep you logged in and essential platform features working. We use analytics cookies (with your consent) to understand how users interact with the platform so we can improve it. You can manage cookie preferences in your browser settings.",
  },
  {
    id: "security",
    heading: "Data security",
    body: "We use industry-standard encryption (TLS) for data in transit and encrypted storage for sensitive data at rest. Access to personal data is restricted to authorised personnel on a need-to-know basis. Despite our measures, no internet transmission is 100% secure; please protect your account credentials.",
  },
  {
    id: "your-rights",
    heading: "Your rights",
    body: "You have the right to access, correct, or delete your personal information at any time through your account settings. You may also request data portability or withdraw consent for marketing communications. To exercise these rights, email us at the address below.",
  },
  {
    id: "children",
    heading: "Children's privacy",
    body: "Tradexo is not directed at children under 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us personal data, please contact support and we will delete it promptly.",
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be communicated via email or an in-app notification at least 14 days before they take effect. Continued use of Tradexo after changes become effective constitutes your acceptance.",
  },
  {
    id: "contact",
    heading: "Contact us",
    body: "For privacy-related questions or requests, email privacy@tradexo.com or write to Tradexo Technologies Private Limited, [Registered Address], India. We aim to respond to all requests within 30 days.",
  },
];

function renderBody(body?: string) {
  if (!body) return null;
  if (body.includes("<") && body.includes(">")) {
    return (
      <div
        className="cms-content space-y-4 leading-relaxed text-neutral-600 [&>*:first-child]:mt-0 [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-neutral-800 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(body) }}
      />
    );
  }
  return <p className="whitespace-pre-line leading-relaxed text-neutral-600">{body}</p>;
}

export default async function PrivacyPage() {
  const page = await fetchCmsPage("privacy");
  const title = page?.title || "Privacy Policy";
  const hasCmsContent = !!page?.body?.trim();

  return (
    <MainLayout>
      {/* Page header */}
      <div className="border-b border-neutral-100 bg-gradient-to-br from-[#F0F0F0] via-[#E5E5E5]/30 to-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-neutral-400">
            <Link href="/" className="transition-colors hover:text-[#FF6C00]">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <span className="font-medium text-neutral-600">Privacy Policy</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Last updated: <time dateTime="2024-01-01">January 2024</time>
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            This policy explains how Tradexo collects, uses, and safeguards your personal
            information. Please read it carefully before using the platform.
          </p>
        </div>
      </div>

      {/* Document layout */}
      <div className="bg-neutral-50 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-4 lg:gap-10">

            {/* Sticky ToC — desktop only */}
            <aside className="hidden lg:block lg:col-span-1">
              <nav
                aria-label="Table of contents"
                className="sticky top-24 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Contents
                </p>
                <ul className="space-y-1">
                  {TOC_SECTIONS.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="block rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-[#F0F0F0] hover:text-[#FF6C00]"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main document */}
            <article className="lg:col-span-3">
              <div className="rounded-xl border border-neutral-100 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
                {hasCmsContent ? (
                  renderBody(page?.body)
                ) : (
                  <div className="space-y-10">
                    {FALLBACK_SECTIONS.map(({ id, heading, body }) => (
                      <section key={id} id={id} className="scroll-mt-24">
                        <h2 className="text-xl font-bold text-neutral-900">{heading}</h2>
                        <p className="mt-3 leading-relaxed text-neutral-600">{body}</p>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
