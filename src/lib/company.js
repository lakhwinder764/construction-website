export const company = {
  name: "RMKK LTD",
  number: "17464070",
  status: "Active",
  type: "Private limited company",
  jurisdiction: "England",
  incorporated: "2026-09-16",
  office: {
    lines: ["Flat 3 Panorama Apartments", "2 Harefield Road", "Uxbridge", "England", "UB8 1GW"],
    short: "Uxbridge, UB8 1GW",
  },
  geo: {
    lat: 51.54795,
    lon: -0.4823,
    label: "UB8 1GW",
  },
  sic: [
    {
      code: "41201",
      title: "Commercial buildings",
      summary:
        "Offices, shops, and other commercial shells. RMKK is registered to construct the buildings people work in.",
      points: ["New commercial structures", "Shell and core coordination", "Site sequencing around occupied neighbours"],
    },
    {
      code: "41202",
      title: "Domestic buildings",
      summary:
        "Houses, flats, and work to existing homes. The same registration covers buildings people live in.",
      points: ["Houses and apartment buildings", "Extensions and alterations", "Careful work on lived-in streets"],
    },
  ],
  accounts: {
    label: "First accounts",
    madeUpTo: "2027-09-30",
    due: "2028-06-16",
  },
  confirmation: {
    label: "First confirmation statement",
    statementDate: "2027-09-15",
    due: "2027-09-29",
  },
  reminders:
    "Companies House eReminders are active for accounts and confirmation statement reminders.",
  people: [
    {
      name: "Raman Kaur",
      email: "ramankaur.61406@gmail.com",
      phone: "07453814065",
      role: "eReminder contact",
    },
  ],
  registerUrl: "https://find-and-update.company-information.service.gov.uk/company/17464070",
  sourceNote:
    "Company facts are the Companies House public record for 17464070. Countdowns run from those filing dates. Weather is live for the registered office.",
};

export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=51.54795&longitude=-0.48230" +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,is_day" +
  "&hourly=temperature_2m,precipitation_probability,wind_speed_10m" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset" +
  "&timezone=Europe%2FLondon&forecast_days=3&wind_speed_unit=kmh";
