import { useEffect, useState } from "react";
import { WEATHER_URL, company } from "./company";

export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function formatClock(date) {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
  const zone =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value || "London";
  return { time, zone };
}

export function formatLong(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatWeekday(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function londonOffsetMinutes(date) {
  const name =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      timeZoneName: "shortOffset",
      hour: "2-digit",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value || "GMT";
  const match = name.match(/GMT([+-]\d+)?/);
  if (!match || !match[1]) return 0;
  return Number.parseInt(match[1], 10) * 60;
}

function londonInstant(isoDate, hours, minutes, seconds) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  const offset = londonOffsetMinutes(new Date(utc));
  return utc - offset * 60_000;
}

export function useCountdown(isoDate) {
  const now = useNow();
  const target = londonInstant(isoDate, 23, 59, 59);
  const diff = Math.max(0, target - now.getTime());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

export function useSince(isoDate) {
  const now = useNow();
  const start = londonInstant(isoDate, 0, 0, 0);
  const diff = Math.max(0, now.getTime() - start);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

const WEATHER_LABELS = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export function weatherLabel(code) {
  return WEATHER_LABELS[code] || "Live conditions";
}

export function assessSite(current) {
  if (!current) return null;
  const gust = current.wind_gusts_10m;
  const rain = current.precipitation;
  const temp = current.temperature_2m;
  const crane = gust >= 45 ? "Hold" : gust >= 30 ? "Caution" : "Open";
  const concrete = temp < 5 || rain > 1 ? "Caution" : "Open";
  const external = rain > 0.2 || gust >= 40 ? "Caution" : "Open";
  let note = "Weather at the Uxbridge office is inside a normal working window.";
  if (crane === "Hold") {
    note = "Gusts are high enough to pause crane lifts at this weather point.";
  } else if (external === "Caution") {
    note = "External work needs a closer look: rain or gusts are up.";
  } else if (concrete === "Caution") {
    note = "Concrete work needs care in this temperature or rain.";
  } else if (crane === "Caution") {
    note = "Wind is rising. Crane lifts should be judged on site.";
  }
  return { crane, concrete, external, note };
}

export function daylightLeft(sunrise, sunset, now) {
  const start = new Date(sunrise).getTime();
  const end = new Date(sunset).getTime();
  const current = now.getTime();
  if (current < start) {
    return { state: "Before sunrise", ms: start - current };
  }
  if (current > end) {
    return { state: "After sunset", ms: 0 };
  }
  return { state: "Daylight left", ms: end - current };
}

export function formatSpan(ms) {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (ms <= 0) return "0h 00m";
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await fetch(WEATHER_URL);
        if (!response.ok) throw new Error("Weather feed unavailable");
        const data = await response.json();
        if (ignore) return;
        setWeather(data);
        setError("");
        setFetchedAt(new Date());
      } catch (err) {
        if (!ignore) setError(err.message || "Weather feed unavailable");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ignore = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return { weather, error, loading, fetchedAt, place: company.geo };
}
