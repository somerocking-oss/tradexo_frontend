import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { buildCmsMetadata, fetchCmsPage } from "@/lib/cms";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage("terms");
  return buildCmsMetadata(page, {
    title: "Terms of Service",
    description: "Tradexo terms of service for businesses and users.",
  });
}

const TOC_SECTIONS = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Accounts & listings" },
  { id: "buyer-conduct", label: "Buyer conduct" },
  { id: "seller-conduct", label: "Seller conduct" },
  { id: "payments", label: "Payments & plans" },
  { id: "content", label: "Content & IP" },
  { id: "prohibited", label: "Prohibited activities" },
  { id: "disclaimer", label: "Disclaimer & liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "contact", label: "Contact us" },
] as const;

const FALLBACK_SECTIONS: { id: string; heading: string; body: string }[] = [
  {
    id: "acceptance",
    heading: "Acceptance of terms",
    body: "By accessing or using Tradexo, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please stop using the platform immediately. These terms apply to all visitors, registered users, and businesses using the platform.",
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    body: "You must be at least 18 years old and have the legal capacity to enter into binding agreements. By registering, you confirm that all information you provide is accurate and current. Tradexo reserves the right to refuse service to anyone at its sole discretion.",
  },
  {
    id: "accounts",
    heading: "Accounts & listings",
    body: "Each business may maintain one active listing per unique entity. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Listings must accurately represent the business and must not be misleading or fraudulent.",
  },
  {
    id: "buyer-conduct",
    heading: "Buyer conduct",
    body: "Buyers must use the platform in good faith to find products and services. Posting fake RFQs, scraping contact details, or contacting sellers for purposes unrelated to legitimate business enquiries is prohibited.",
  },
  {
    id: "seller-conduct",
    heading: "Seller conduct",
    body: "Sellers must respond to genuine buyer enquiries in a timely and professional manner. Misrepresenting products, prices, certifications, or business details is grounds for immediate suspension. Sellers must hold all required licences and registrations for their industry.",
  },
  {
    id: "payments",
    heading: "Payments & plans",
    body: "Premium plan fees are charged in advance and are non-refundable unless otherwise stated. Tradexo uses a third-party payment gateway; by completing a transaction you agree to that gateway's terms. Invoices are available in your seller dashboard.",
  },
  {
    id: "content",
    heading: "Content & intellectual property",
    body: "You retain ownership of content you upload (photos, descriptions) but grant Tradexo a worldwide, royalty-free licence to display and promote that content on the platform and in marketing materials. You must not upload content that infringes any third-party intellectual property rights.",
  },
  {
    id: "prohibited",
    heading: "Prohibited activities",
    body: "The following are strictly prohibited: impersonating another person or business; distributing malware or attempting to hack the platform; using automated tools to scrape or bulk-download data; posting adult, violent, or hateful content; creating fake reviews or ratings.",
  },
  {
    id: "disclaimer",
    heading: "Disclaimer & limitation of liability",
    body: "Tradexo is a marketplace platform and is not a party to transactions between buyers and sellers. We make no warranty about the accuracy of listings or the conduct of users. To the maximum extent permitted by law, our aggregate liability for any claim is limited to the fees you paid to Tradexo in the 3 months preceding the claim.",
  },
  {
    id: "termination",
    heading: "Termination",
    body: "We may suspend or terminate your account at any time for violation of these terms or for any other reason with or without notice. You may close your account by contacting support. On termination, your listings will be removed; your obligations under these terms survive termination.",
  },
  {
    id: "governing-law",
    heading: "Governing law",
    body: "These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts of [City], India. If any provision is found unenforceable, the remaining provisions continue in full force.",
  },
  {
    id: "contact",
    heading: "Contact us",
    body: "For questions about these Terms, email legal@tradexo.com or write to Tradexo Technologies Private Limited, [Registered Address], India.",
  },
];

function renderBody(body?: string) {
  if (!body) return null;
  if (body.includes("<") && body.includes(">")) {
    return (
      <div
        className="cms-content space-y-4 leading-relaxed text-neutral-600 [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-neutral-800 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(body) }}
      />
    );
  }
  return <p className="whitespace-pre-line leading-relaxed text-neutral-600">{body}</p>;
}

export default async function TermsPage() {
  const page = await fetchCmsPage("terms");
  const title = page?.title || "Terms of Service";
  const hasCmsContent = !!page?.body?.trim();

  return (
    <MainLayout>
      {/* Page header */}
      <div className="border-b border-neutral-100 bg-gradient-to-br from-[#F0F0F0] via-[#E5E5E5]/30 to-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-8xl">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-neutral-400">
            <Link href="/" className="transition-colors hover:text-[#FF6C00]">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <span className="font-medium text-neutral-600">Terms of Service</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Last updated: <time dateTime="2024-01-01">January 2024</time>
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            These terms govern your use of Tradexo. By accessing the platform you agree to be
            bound by them. Please read them carefully.
          </p>
        </div>
      </div>

      {/* Document layout */}
      <div className="bg-neutral-50 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-8xl">
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

                {/* Footer note */}
                <div className="mt-10 rounded-xl border border-neutral-100 bg-neutral-50 p-5 text-sm text-neutral-500">
                  These Terms of Service are governed by the laws of India. For any questions,
                  contact{" "}
                  <a
                    href="mailto:legal@tradexo.com"
                    className="font-medium text-[#FF6C00] hover:underline"
                  >
                    legal@tradexo.com
                  </a>
                  . See also our{" "}
                  <Link href="/privacy" className="font-medium text-[#FF6C00] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
