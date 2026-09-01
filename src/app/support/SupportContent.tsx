"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import type { CmsPage, SiteSettings } from "@/lib/cms";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";
import { SupportFaq } from "./SupportFaq";

const BUYER_LINKS = [
  { href: "/post-requirement", icon: ShoppingBag, label: "Post requirement", hint: "Get free quotes" },
  { href: "/profile/requirements", icon: FileText, label: "My requirements", hint: "Track RFQ quotes" },
  { href: "/listings", icon: Building2, label: "Browse listings", hint: "Find suppliers" },
] as const;

const SELLER_LINKS = [
  { href: "/register-business", icon: Building2, label: "Register business", hint: "Free listing" },
  { href: "/dashboard/leads", icon: MessageSquare, label: "Leads inbox", hint: "Buyer enquiries" },
  { href: "/plans", icon: CreditCard, label: "Premium plans", hint: "Boost visibility" },
] as const;

const HELP_CATEGORIES = [
  { icon: Building2, title: "Business listings", hint: "Create, edit & manage your profile" },
  { icon: Users, title: "Leads & enquiries", hint: "Receive and manage buyer leads" },
  { icon: FileText, title: "RFQ marketplace", hint: "Post and respond to requirements" },
  { icon: CreditCard, title: "Payments & plans", hint: "Billing, invoices & upgrades" },
  { icon: Zap, title: "Account & login", hint: "OTP login, profile, settings" },
  { icon: BookOpen, title: "Policies", hint: "Terms, privacy & compliance" },
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

interface SupportContentProps {
  page: CmsPage | null;
  settings: SiteSettings | null;
}

export function SupportContent({ page, settings }: SupportContentProps) {
  const email = settings?.contactEmail || "support@Tradexo.com";
  const phone = settings?.contactPhone || "";

  return (
    <div className="bg-neutral-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-8xl space-y-10">

        {/* Help categories grid */}
        <section>
          <h2 className="mb-5 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Browse help topics
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CATEGORIES.map(({ icon: Icon, title, hint }) => (
              <div
                key={title}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6C00]/20 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E5E5E5]">
                  <Icon className="h-5 w-5 text-[#FF6C00]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900">{title}</p>
                  <p className="text-xs text-neutral-500">{hint}</p>
                </div>
                <ArrowRight
                  className="ml-auto h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-[#FF6C00]"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </section>

        {/* Main 2-col grid */}
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Contact sidebar */}
          <aside className="space-y-4 lg:col-span-1">
            {/* Contact options */}
            <Card className="border-neutral-100 shadow-sm">
              <CardBody className="p-5 sm:p-6">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-neutral-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5E5E5]">
                    <Phone className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                  </span>
                  Contact us
                </h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Our team typically responds within one business day.
                </p>

                <ul className="mt-5 space-y-3">
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 transition-all duration-200 hover:border-[#FF6C00]/25 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E5E5E5] text-[#FF6C00]">
                        <Mail className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                          Email
                        </p>
                        <p className="truncate text-sm font-semibold text-neutral-900">{email}</p>
                      </div>
                    </a>
                  </li>
                  {phone && (
                    <li>
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 transition-all duration-200 hover:border-[#FF6C00]/25 hover:bg-white hover:shadow-sm"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E5E5E5] text-[#FF6C00]">
                          <Phone className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                            Phone
                          </p>
                          <p className="text-sm font-semibold text-neutral-900">{phone}</p>
                        </div>
                      </a>
                    </li>
                  )}
                </ul>

                <div className="mt-5 rounded-xl bg-[#F0F0F0] px-4 py-3.5">
                  <p className="text-sm font-semibold text-neutral-900">Support hours</p>
                  <p className="mt-1 text-sm text-neutral-500">Monday – Saturday</p>
                  <p className="text-sm text-neutral-500">10:00 AM – 7:00 PM IST</p>
                </div>
              </CardBody>
            </Card>

            {/* Policies */}
            <Card className="border-neutral-100 shadow-sm">
              <CardBody className="p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-neutral-900">Policies &amp; legal</h3>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      href="/terms"
                      className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#FF6C00]"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#FF6C00]"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/infringement"
                      className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#FF6C00]"
                    >
                      <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Infringement Policy
                    </Link>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </aside>

          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Buyer / Seller quick links */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-neutral-100 shadow-sm transition-all duration-200 hover:shadow-md">
                <CardBody className="p-5 sm:p-6">
                  <h2 className="flex items-center gap-2.5 font-bold text-neutral-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5E5E5]">
                      <ShoppingBag className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                    </span>
                    Buyer help
                  </h2>
                  <ul className="mt-4 space-y-1.5">
                    {BUYER_LINKS.map(({ href, icon: Icon, label, hint }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#F0F0F0]"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#FF6C00]" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900">{label}</p>
                            <p className="text-xs text-neutral-400">{hint}</p>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-[#FF6C00]"
                            aria-hidden
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card className="border-neutral-100 shadow-sm transition-all duration-200 hover:shadow-md">
                <CardBody className="p-5 sm:p-6">
                  <h2 className="flex items-center gap-2.5 font-bold text-neutral-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5E5E5]">
                      <Building2 className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                    </span>
                    Seller help
                  </h2>
                  <ul className="mt-4 space-y-1.5">
                    {SELLER_LINKS.map(({ href, icon: Icon, label, hint }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#F0F0F0]"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#FF6C00]" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900">{label}</p>
                            <p className="text-xs text-neutral-400">{hint}</p>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-[#FF6C00]"
                            aria-hidden
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="mb-4 flex items-center gap-2.5 text-xl font-bold text-neutral-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5E5E5]">
                  <HelpCircle className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                </span>
                Frequently asked questions
              </h2>
              <SupportFaq />
            </div>

            {/* CMS body */}
            {page?.body && (
              <Card className="border-neutral-100 shadow-sm">
                <CardBody className="p-5 sm:p-7">
                  <h2 className="text-lg font-bold text-neutral-900">Additional information</h2>
                  <div className="mt-4">
                    <CmsBody body={page.body} />
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
