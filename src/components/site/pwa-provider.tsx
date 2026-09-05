"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = "gbt_pwa_dismissed_until";
const DISMISS_DAYS = 7;

function shouldShowPrompt() {
  const until = localStorage.getItem(DISMISSED_KEY);
  if (!until) return true;
  return Date.now() > parseInt(until, 10);
}

function dismissPrompt() {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISSED_KEY, String(until));
}

export function PwaProvider() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Delay 3s so it doesn't feel jarring on first load
      setTimeout(() => {
        if (shouldShowPrompt()) setShowPrompt(true);
      }, 3000);
    }

    // Capture standard Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        if (shouldShowPrompt()) setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    dismissPrompt();
  };

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      localStorage.removeItem(DISMISSED_KEY);
    }
    setInstallPromptEvent(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96 rounded-xl border border-border bg-white p-4 shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-forest-950">Install GBT App</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isIos
                ? "Tap Share → Add to Home Screen for quick access."
                : "Add to your home screen for fast, offline access."}
            </p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 text-muted-foreground hover:bg-gray-100 rounded-full"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {!isIos && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-forest-900 text-white hover:bg-forest-800"
          >
            Install
          </Button>
          <button
            onClick={dismiss}
            className="flex-1 text-xs text-muted-foreground hover:text-foreground text-center py-2"
          >
            Maybe later
          </button>
        </div>
      )}
    </div>
  );
}
