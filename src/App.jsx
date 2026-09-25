import { useEffect, useMemo, useState } from "react";
import Scene from "./components/Scene";
import { company } from "./lib/company";
import {
  assessSite,
  daylightLeft,
  formatClock,
  formatLong,
  formatSpan,
  formatWeekday,
  useCountdown,
  useNow,
  useSince,
  useWeather,
  weatherLabel,
} from "./lib/live";

const links = [
  ["Home", "#top"],
  ["Services", "#services"],
  ["Why RMKK", "#why"],
  ["Book", "#contact"],
];

function Nav() {
  const now = useNow();
  const clock = formatClock(now);
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <a className="wordmark" href="#top">
        RMKK
      </a>
      <nav className={open ? "open" : ""} aria-label="Primary">
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-meta">
        <time dateTime={now.toISOString()}>
          {clock.time} <span>{clock.zone}</span>
        </time>
        <button
          className="menu"
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="pulse" aria-hidden="true" />
          {company.status} · {company.type} · {company.jurisdiction}
        </p>
        <h1>
          precision in
          <br />
          <em>construction.</em>
        </h1>
        <p className="lede">
          {company.name} plans and builds commercial and domestic buildings from Uxbridge, with the
          schedule and the public record kept in view.
        </p>
        <div className="actions">
          <a className="btn" href="#contact">
            Book a consultation
          </a>
          <a className="btn ghost" href="#services">
            Our services
          </a>
        </div>
        <dl className="hero-facts">
          <div>
            <dt>Company</dt>
            <dd>{company.number}</dd>
          </div>
          <div>
            <dt>Office</dt>
            <dd>{company.office.short}</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>SIC 41201 · 41202</dd>
          </div>
        </dl>
      </div>
      <div className="maquette">
        <Scene />
        <div className="titleblock">
          <span>Study model</span>
          <span>01</span>
          <span>Commercial + domestic</span>
          <span>Uxbridge</span>
        </div>
        <p className="orbit-hint">Drag to orbit</p>
      </div>
    </section>
  );
}

function LiveStrip() {
  const { weather, loading, error } = useWeather();
  const current = weather?.current;
  const site = assessSite(current);
  const tone = site ? (site.crane === "Hold" ? "hold" : site.external === "Caution" || site.concrete === "Caution" || site.crane === "Caution" ? "warn" : "good") : "";

  return (
    <section className="strip" aria-label="Live site conditions">
      <p>
        <span>Uxbridge now</span>
        <strong>
          {current ? `${Math.round(current.temperature_2m)}°` : loading ? "…" : "—"}
        </strong>
        <em>{current ? weatherLabel(current.weather_code) : error || "Reading weather"}</em>
      </p>
      <p>
        <span>Wind</span>
        <strong>{current ? `${Math.round(current.wind_speed_10m)} km/h` : "—"}</strong>
        <em>{current ? `Gusts ${Math.round(current.wind_gusts_10m)}` : "Registered office"}</em>
      </p>
      <p>
        <span>Working window</span>
        <strong className={tone}>{site ? site.crane === "Hold" ? "Hold" : tone === "warn" ? "Caution" : "Open" : "—"}</strong>
        <em>{site ? site.note : "Waiting for the feed"}</em>
      </p>
      <a className="strip-link" href="#conditions">
        Open the board
      </a>
    </section>
  );
}

const offerings = [
  {
    id: "new-build",
    title: "New Build Construction",
    copy: "A first session on a new commercial or domestic building.",
    duration: "1 hr 30 min",
    price: 150,
    image: "/images/domestic.jpg",
    alt: "A timber house with a garden at dusk",
  },
  {
    id: "commercial",
    title: "Commercial Space Planning",
    copy: "Planning a commercial building, registered under SIC 41201.",
    duration: "2 hr",
    price: 200,
    image: "/images/commercial.jpg",
    alt: "Glass office towers seen from street level",
  },
  {
    id: "renovation",
    title: "Renovation Consultation",
    copy: "A shorter session on alterations to an existing building.",
    duration: "1 hr",
    price: 100,
    image: "/images/consultation.jpg",
    alt: "An architect marking up a building drawing",
  },
];

function openBooking(id) {
  sessionStorage.setItem("rmkk-service", id);
  window.dispatchEvent(new CustomEvent("rmkk-book", { detail: id }));
}

function Practice() {
  return (
    <section className="section" id="services">
      <div className="section-head">
        <h2>our services</h2>
      </div>
      <div className="service-row">
        {offerings.map((item) => (
          <article key={item.id}>
            <img src={item.image} alt={item.alt} />
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
            <p className="service-meta">
              {item.duration} · £{item.price}
            </p>
            <a
              className="btn"
              href="#contact"
              onClick={() => openBooking(item.id)}
            >
              Book now
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Why() {
  const points = [
    ["Clear scope", "Commercial and domestic construction, stated on the Companies House record for 17464070."],
    ["A visible schedule", "Confirmation statement and first accounts dates stay on this page and count down live."],
    ["Site conditions", "Wind, rain, and daylight for the Uxbridge office update from a live weather feed."],
  ];
  return (
    <section className="section" id="why">
      <div className="section-head">
        <h2>why rmkk</h2>
      </div>
      <figure className="why-photo">
        <img src="/images/hero-site.jpg" alt="A construction crew reviewing a concrete slab and rebar deck" />
      </figure>
      <div className="why-row">
        {points.map(([title, copy]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Record() {
  const since = useSince(company.incorporated);
  const confirmation = useCountdown(company.confirmation.due);
  const accounts = useCountdown(company.accounts.due);

  return (
    <section className="section record" id="record">
      <div className="section-head">
        <p className="index">02</p>
        <h2>The public record</h2>
      </div>
      <div className="record-grid">
        <div className="since">
          <p>Since {formatLong(company.incorporated)}</p>
          <p className="since-num">
            {since.days}
            <span>days</span>
          </p>
          <p className="since-sub">
            {since.hours}h {String(since.minutes).padStart(2, "0")}m {String(since.seconds).padStart(2, "0")}s
          </p>
          <p className="status-line">
            <span className="pulse" aria-hidden="true" /> {company.status} on Companies House
          </p>
        </div>
        <dl className="facts">
          <dt>Name</dt>
          <dd>{company.name}</dd>
          <dt>Number</dt>
          <dd>{company.number}</dd>
          <dt>Type</dt>
          <dd>{company.type}</dd>
          <dt>Registered office</dt>
          <dd>{company.office.lines.join(", ")}</dd>
          <dt>Nature of business</dt>
          <dd>
            {company.sic.map((item) => (
              <span key={item.code}>
                {item.code} — {item.title}
              </span>
            ))}
          </dd>
          <dt>Reminders</dt>
          <dd>{company.reminders}</dd>
        </dl>
      </div>
      <div className="counts">
        <article>
          <p>{company.confirmation.label}</p>
          <p className="count-num">
            {confirmation.days}
            <span>days</span>
          </p>
          <p className="count-sub">
            {confirmation.hours}h {String(confirmation.minutes).padStart(2, "0")}m{" "}
            {String(confirmation.seconds).padStart(2, "0")}s
          </p>
          <p>Due {formatLong(company.confirmation.due)}</p>
        </article>
        <article>
          <p>{company.accounts.label}</p>
          <p className="count-num">
            {accounts.days}
            <span>days</span>
          </p>
          <p className="count-sub">
            {accounts.hours}h {String(accounts.minutes).padStart(2, "0")}m{" "}
            {String(accounts.seconds).padStart(2, "0")}s
          </p>
          <p>
            Made up to {formatLong(company.accounts.madeUpTo)} · due {formatLong(company.accounts.due)}
          </p>
        </article>
      </div>
      <p className="source">{company.sourceNote}</p>
      <a className="btn" href={company.registerUrl} target="_blank" rel="noreferrer">
        Open Companies House
      </a>
    </section>
  );
}

function TempChart({ weather }) {
  if (!weather?.hourly) return null;
  const times = weather.hourly.time;
  const start = Math.max(0, times.findIndex((time) => time >= weather.current.time.slice(0, 13)));
  const temps = weather.hourly.temperature_2m.slice(start, start + 24);
  const labels = times.slice(start, start + 24);
  if (temps.length < 2) return null;
  const width = 640;
  const height = 168;
  const pad = 18;
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const x = (index) => pad + (index / (temps.length - 1)) * (width - pad * 2);
  const y = (temp) => height - pad - ((temp - min) / (max - min)) * (height - pad * 2);
  const line = temps.map((temp, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(temp)}`).join(" ");
  const area = `${line} L${x(temps.length - 1)},${height - pad} L${x(0)},${height - pad} Z`;
  return (
    <figure className="chart">
      <figcaption>Next 24 hours · temperature at UB8 1GW</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Temperature over the next 24 hours">
        <path d={area} className="area" />
        <path d={line} className="line" />
        {temps.map((temp, index) =>
          index % 6 === 0 ? (
            <text key={labels[index]} x={x(index)} y={height - 2}>
              {labels[index].slice(11, 16)}
            </text>
          ) : null
        )}
      </svg>
    </figure>
  );
}

function Conditions() {
  const now = useNow();
  const { weather, error, loading, fetchedAt } = useWeather();
  const current = weather?.current;
  const site = assessSite(current);
  const sun = weather?.daily;
  const light = sun ? daylightLeft(sun.sunrise[0], sun.sunset[0], now) : null;

  return (
    <section className="section" id="conditions">
      <div className="section-head">
        <p className="index">03</p>
        <h2>Live conditions</h2>
      </div>
      <p className="lede narrow">
        A working board for the registered office. Temperature, wind, rain, and daylight come from Open-Meteo
        for {company.geo.lat.toFixed(3)}, {company.geo.lon.toFixed(3)}.
      </p>
      {error && !current ? (
        <p className="error">{error}. The company record above still runs from Companies House.</p>
      ) : null}
      <div className="board">
        <div className="temp-hero">
          <p>{current ? weatherLabel(current.weather_code) : loading ? "Reading the feed" : "Unavailable"}</p>
          <p className="temp">{current ? Math.round(current.temperature_2m) : "—"}°</p>
          <p>{site?.note}</p>
        </div>
        <dl>
          <div>
            <dt>Feels like</dt>
            <dd>{current ? `${Math.round(current.apparent_temperature)}°` : "—"}</dd>
          </div>
          <div>
            <dt>Humidity</dt>
            <dd>{current ? `${current.relative_humidity_2m}%` : "—"}</dd>
          </div>
          <div>
            <dt>Rain</dt>
            <dd>{current ? `${current.precipitation} mm` : "—"}</dd>
          </div>
          <div>
            <dt>Cloud</dt>
            <dd>{current ? `${current.cloud_cover}%` : "—"}</dd>
          </div>
          <div>
            <dt>Wind</dt>
            <dd>{current ? `${Math.round(current.wind_speed_10m)} km/h` : "—"}</dd>
          </div>
          <div>
            <dt>{light?.state || "Daylight"}</dt>
            <dd>{light ? formatSpan(light.ms) : "—"}</dd>
          </div>
        </dl>
      </div>
      <div className="ops">
        {[
          ["Crane lifts", site?.crane],
          ["Concrete", site?.concrete],
          ["External work", site?.external],
        ].map(([label, value]) => (
          <p key={label} className={(value || "").toLowerCase()}>
            <span>{label}</span>
            <strong>{value || "—"}</strong>
          </p>
        ))}
      </div>
      <p className="fine">
        Crane hold above 45 km/h gusts. Concrete caution below 5°C or above 1 mm of rain. External caution
        above 0.2 mm of rain or 40 km/h gusts.
        {fetchedAt ? ` Updated ${formatClock(fetchedAt).time}.` : ""}
      </p>
      <TempChart weather={weather} />
      {sun ? (
        <div className="days">
          {sun.time.map((day, index) => (
            <article key={day}>
              <p>{formatWeekday(day)}</p>
              <h3>{weatherLabel(sun.weather_code[index])}</h3>
              <p>
                {Math.round(sun.temperature_2m_max[index])}° / {Math.round(sun.temperature_2m_min[index])}°
              </p>
              <p>{sun.precipitation_sum[index]} mm rain</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

const slots = ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00"];

function monthGrid(anchor) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const mondayOffset = (first.getDay() + 6) % 7;
  start.setDate(1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function Contact() {
  const [serviceId, setServiceId] = useState(offerings[0].id);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booked, setBooked] = useState(null);
  const service = offerings.find((item) => item.id === serviceId) || offerings[0];
  const days = useMemo(() => monthGrid(cursor), [cursor]);
  const today = dayKey(new Date());
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=-0.4923%2C51.5400%2C-0.4723%2C51.5560&layer=mapnik&marker=${company.geo.lat}%2C${company.geo.lon}`;

  useEffect(() => {
    const saved = sessionStorage.getItem("rmkk-service");
    if (saved && offerings.some((item) => item.id === saved)) setServiceId(saved);
    const onBook = (event) => {
      if (offerings.some((item) => item.id === event.detail)) {
        setServiceId(event.detail);
        setBooked(null);
      }
    };
    window.addEventListener("rmkk-book", onBook);
    return () => window.removeEventListener("rmkk-book", onBook);
  }, []);

  function chooseService(id) {
    setServiceId(id);
    setSelectedTime("");
    setBooked(null);
  }

  function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBooked({
      service: service.title,
      duration: service.duration,
      price: service.price,
      day: selectedDay,
      time: selectedTime,
      name: data.get("name"),
      email: data.get("email"),
    });
  }

  return (
    <section className="section contact" id="contact">
      <div className="section-head">
        <p className="index">04</p>
        <h2>Book online</h2>
      </div>
      <p className="crumb">
        <a href="#top">Home</a>
        <span>Services</span>
      </p>
      <div className="book-layout">
        <div className="book-services">
          {offerings.map((item) => (
            <article key={item.id} className={item.id === service.id ? "is-selected" : ""}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <p className="service-meta">
                  {item.duration} · £{item.price}
                </p>
              </div>
              <button type="button" className="btn" onClick={() => chooseService(item.id)}>
                Book now
              </button>
            </article>
          ))}
          <iframe title="Map of the RMKK LTD registered office in Uxbridge" src={map} loading="lazy" />
        </div>
        <div className="scheduler">
          <p className="service-meta">Schedule · {service.title}</p>
          <div className="cal-head">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              ‹
            </button>
            <strong>
              {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </strong>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              ›
            </button>
          </div>
          <div className="cal-grid" aria-label="Choose a date">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label) => (
              <span key={label} className="dow">
                {label}
              </span>
            ))}
            {days.map((day) => {
              const key = dayKey(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const past = key < today;
              const weekend = day.getDay() === 0 || day.getDay() === 6;
              const disabled = !inMonth || past || weekend;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  className={`${selectedDay === key ? "is-on" : ""} ${key === today ? "is-today" : ""} ${inMonth ? "" : "out"}`}
                  onClick={() => {
                    setSelectedDay(key);
                    setSelectedTime("");
                    setBooked(null);
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="slots">
            {slots.map((time) => (
              <button
                key={time}
                type="button"
                className={selectedTime === time ? "is-on" : ""}
                disabled={!selectedDay}
                onClick={() => {
                  setSelectedTime(time);
                  setBooked(null);
                }}
              >
                {time}
              </button>
            ))}
          </div>
          {booked ? (
            <div className="booked">
              <h3>Booked</h3>
              <p>
                {booked.service} on {booked.day} at {booked.time}.
              </p>
              <p>
                {booked.duration} · £{booked.price} · {booked.name}
              </p>
              <p className="fine">Held on this page for {booked.email}. A payment link is not connected yet.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <label>
                Full name
                <input name="name" required autoComplete="name" />
              </label>
              <label>
                Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" autoComplete="tel" />
              </label>
              <button className="btn" type="submit" disabled={!selectedDay || !selectedTime}>
                Confirm {selectedTime || "a time"}
              </button>
              <p className="fine">Weekdays only. Choose a date and a time, then confirm. £{service.price} for this session.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <LiveStrip />
        <Practice />
        <Why />
        <Record />
        <Conditions />
        <Contact />
      </main>
      <footer className="site-footer">
        <div>
          <strong>{company.name}</strong>
          <p>Company No. {company.number}</p>
          <p>{company.office.lines.join(", ")}</p>
        </div>
        <div>
          {company.people.map((person) => (
            <p key={person.email}>
              {person.name}
              <a href={`mailto:${person.email}`}>{person.email}</a>
            </p>
          ))}
          <a href={company.registerUrl} target="_blank" rel="noreferrer">
            Companies House
          </a>
        </div>
        <p className="copy">© 2026 {company.name}. Photographs from Unsplash.</p>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GeneralContractor",
            name: company.name,
            identifier: company.number,
            email: company.people[0].email,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Flat 3 Panorama Apartments, 2 Harefield Road",
              addressLocality: "Uxbridge",
              postalCode: "UB8 1GW",
              addressCountry: "GB",
            },
            url: company.registerUrl,
          }),
        }}
      />
    </>
  );
}
