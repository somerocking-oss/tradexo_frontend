"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mic, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { getSearchAutocomplete, type SearchSuggestion } from "@/lib/api/search";
import { buildListingsUrl } from "@/lib/listings-url";
import { getBusinessProfilePath } from "@/lib/business-url";
import { cn } from "@/lib/utils";

interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined ?? null;
}

interface SearchAutocompleteProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  city?: string;
  onSubmit: () => void;
  inputClassName?: string;
  placeholder?: string;
  showIcon?: boolean;
}

export function SearchAutocomplete({
  keyword,
  onKeywordChange,
  city,
  onSubmit,
  inputClassName,
  placeholder = "Search businesses, products, services...",
  showIcon = true,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(keyword, 300);
  const wrapRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognitionCtor());
  }, []);

  const handleVoiceSearch = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onKeywordChange(transcript);
        setOpen(true);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  useEffect(() => {
    if (!debounced.trim() || debounced.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    getSearchAutocomplete(debounced)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setSuggestions(list);
        setOpen(list.length > 0);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setOpen(false);
      onSubmit();
    }
  };

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-1">
      {showIcon && (
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      )}
      <input
        value={keyword}
        onChange={(e) => {
          onKeywordChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "h-full w-full bg-transparent text-sm outline-none placeholder:text-slate-400",
          showIcon && "pl-10",
          voiceSupported && "pr-10",
          inputClassName
        )}
      />

      {voiceSupported && (
        <button
          type="button"
          onClick={handleVoiceSearch}
          title={listening ? "Listening… click to stop" : "Search by voice"}
          className={cn(
            "absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors",
            listening
              ? "bg-red-100 text-red-600"
              : "text-slate-400 hover:bg-slate-100 hover:text-[#ff6c00]"
          )}
        >
          <Mic className={cn("h-4 w-4", listening && "animate-pulse")} />
        </button>
      )}

      {open && (suggestions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {loading && (
            <p className="px-4 py-3 text-xs text-slate-500">Searching...</p>
          )}
          {suggestions.map((item) => (
            <Link
              key={item._id}
              href={getBusinessProfilePath(item)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-t border-slate-50 px-4 py-3 text-sm transition first:border-t-0 hover:bg-[#e8e8e8]"
            >
              <Building2 className="h-4 w-4 shrink-0 text-[#ff6c00]" />
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{item.name}</p>
                {item.marketplaceType && (
                  <p className="text-xs capitalize text-slate-500">
                    {item.marketplaceType.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(
                buildListingsUrl({
                  keyword: keyword.trim(),
                  city: city?.trim(),
                })
              );
            }}
            className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-semibold text-[#e86200] hover:bg-[#e8e8e8]"
          >
            View all results for &quot;{keyword}&quot; →
          </button>
        </div>
      )}
    </div>
  );
}
