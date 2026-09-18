"use client";

import { useEffect, useRef } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    __googleMapsLoadingPromise?: Promise<void>;
  }
}

function loadGoogleMapsScript(): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__googleMapsLoadingPromise) return window.__googleMapsLoadingPromise;

  window.__googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&language=pt-BR`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Não foi possível carregar o Google Maps."));
    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

export function AddressInput({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!API_KEY || !inputRef.current) return;
    let cancelled = false;
    let autocomplete: google.maps.places.Autocomplete | undefined;

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          { fields: ["formatted_address"] }
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete!.getPlace();
          if (place.formatted_address && inputRef.current) {
            inputRef.current.value = place.formatted_address;
          }
        });
      })
      .catch(() => {
        // Sem Google Maps disponível, o campo continua funcionando como texto livre
      });

    return () => {
      cancelled = true;
      if (autocomplete) {
        window.google?.maps?.event?.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      id="location"
      name="location"
      type="text"
      autoComplete="off"
      defaultValue={defaultValue}
      placeholder={
        API_KEY ? "Comece a digitar o endereço..." : "Ex: Casa do Eiji"
      }
      className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
    />
  );
}
