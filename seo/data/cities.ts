import {
  BASE_URL,
  LAST_UPDATED,
  ORG_NODE,
  SOFTWARE_NODE,
  WEBSITE_NODE,
  buildBreadcrumbSchema,
  renderBreadcrumbsHtml,
} from '../generator';
import type { PageMeta } from '../types';

interface CityConfig {
  slug: string;
  name: string;
  state: string;
  neighborhoods: string[];
  localContext: string;
  rateRange: string;
  popularGames: string;
  operationalProfile: {
    peakHours: string;
    clothGuidance: string;
    typicalVenueMix: string;
  };
}

const CITIES: CityConfig[] = [
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    neighborhoods: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Marathahalli', 'Electronic City', 'JP Nagar', 'Kalyan Nagar', 'Malleshwaram'],
    localContext: 'Bangalore features an active cue-sports and gaming community alongside its extensive technology and commercial corridors. In vibrant business and leisure districts such as Koramangala, Indiranagar, and HSR Layout, club operators often experience concentrated post-work evening sessions where fast dynamic UPI QR checkout, pro-rata split billing between playing groups, and integrated cafe snack tabs streamline front-desk management. In mixed commercial and residential areas like Jayanagar and JP Nagar, venues frequently cater to daytime practice sessions as well as evening recreational match play on well-maintained tables.',
    rateRange: '₹180 – ₹450 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Full-Size Snooker (12x6), 8-Ball & 9-Ball Pool, Console Gaming Stations',
    operationalProfile: {
      peakHours: 'Operators typically plan peak staffing for weekday evenings (approx. 6:00 PM – 11:30 PM) and extended weekend daytime hours',
      clothGuidance: 'Tournament directional wool (such as Strachan 6811 or Hainsworth specifications) for match tables; durable nylon-wool blends for commercial pool',
      typicalVenueMix: 'Common venue layouts range from 4–8 snooker tables, 2–4 pool tables, and optional cafe or lounge seating',
    },
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    neighborhoods: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR (Old Mahabalipuram Road)', 'Porur', 'Tambaram', 'Nungambakkam', 'Kilpauk', 'Mylapore'],
    localContext: 'Chennai has an established history in cue sports and English billiards, with long-standing recreational venues in central districts like Mylapore, T Nagar, and Anna Nagar, alongside modern sports lounges along the OMR corridor. Because coastal humidity can influence cloth nap and ball roll speed, venue operators in coastal regions frequently prioritize air conditioning and routine table maintenance. Transparent minute-by-minute timer billing, shift handover reconciliation, and digital khata ledgers help venue managers maintain structured financial control across daily sessions.',
    rateRange: '₹150 – ₹380 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'English Billiards, Full-Size Tournament Snooker, American 8-Ball Pool',
    operationalProfile: {
      peakHours: 'Operators typically observe higher footfall during evening windows (approx. 5:00 PM – 11:00 PM) and weekend sessions',
      clothGuidance: 'Standard English wool or club-grade cloth; climate control is recommended to protect table nap against coastal humidity',
      typicalVenueMix: 'Typically 3–6 snooker tables, optional billiards or pool tables, and reception or canteen area',
    },
  },
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    neighborhoods: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saravanampatti', 'Singanallur', 'Ganapathy', 'Saibaba Colony', 'Vadavalli'],
    localContext: 'Coimbatore has a growing recreational sports presence driven by its student population and entrepreneur community around areas such as Peelamedu, Gandhipuram, and Saravanampatti. For venues serving college groups and weekend amateur players, operational tools like flexible group bill-splitting, instant UPI settlement, and digital payment reminders help cashiers manage table handovers smoothly and prevent uncollected tabs.',
    rateRange: '₹120 – ₹300 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Snooker Frame Play, 8-Ball Pool, Recreational Challenges',
    operationalProfile: {
      peakHours: 'Operators often schedule staffing around late afternoon and evening student/worker leisure windows (approx. 4:30 PM – 10:30 PM)',
      clothGuidance: 'Club-grade wool-nylon blend cloth recommended for high-turnover recreational tables to optimize durability',
      typicalVenueMix: 'Typically 3–6 tables combining full-size snooker and pool with counter snacks',
    },
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    neighborhoods: ['Madhapur', 'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Kukatpally', 'Ameerpet', 'Begumpet', 'Dilsukhnagar'],
    localContext: 'Commercial development across Hyderabad\'s technology hubs—including Madhapur, Gachibowli, Kondapur, and Jubilee Hills—has supported the establishment of contemporary cue-sports lounges and multi-station entertainment centers. Venue operators in these business districts frequently accommodate corporate groups and evening leisure players, where advance table reservations, transparent on-screen billing, and automated WhatsApp receipts help prevent disputes during peak weekend periods.',
    rateRange: '₹200 – ₹500 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Full-Size Snooker, American Pool, Console Gaming Areas',
    operationalProfile: {
      peakHours: 'Operators typically plan for peak demand during evening hours (approx. 6:30 PM – Midnight) and weekend afternoons',
      clothGuidance: 'Tournament-grade wool for competitive tables; durable blended cloth for high-volume pool tables',
      typicalVenueMix: 'Typically 4–8 snooker tables, 2–4 pool tables, with optional private bays or cafe counter',
    },
  },
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    neighborhoods: ['Bandra West', 'Andheri West', 'Powai', 'Lower Parel', 'Thane West', 'Navi Mumbai (Vashi & Nerul)', 'Borivali', 'Dadar', 'Juhu'],
    localContext: 'Across the Mumbai Metropolitan Region—from western suburban hubs like Bandra, Andheri, and Borivali to commercial zones in Lower Parel and Navi Mumbai—commercial floor space is at a premium. For club operators, maximizing billable minutes per square foot is a key priority. Precise table session timers, automated minute-level billing, and structured shift handovers help owners minimize table downtime and maintain accurate audit trails.',
    rateRange: '₹250 – ₹650 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'American Pool, Full-Size Snooker, Console Gaming Booths',
    operationalProfile: {
      peakHours: 'Operators typically see concentrated traffic in late evening windows (approx. 6:00 PM – 11:30 PM) and throughout weekends',
      clothGuidance: 'High-durability directional wool or commercial blends, with dehumidifiers recommended during monsoon months',
      typicalVenueMix: 'Space-efficient layouts typically featuring 3–6 snooker tables and 2–3 pool tables',
    },
  },
  {
    slug: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi / NCR',
    neighborhoods: ['Connaught Place', 'South Extension', 'Hauz Khas', 'Noida Sector 18 & 62', 'Gurgaon Cyber City & Golf Course Road', 'Dwarka', 'Rohini', 'Lajpat Nagar'],
    localContext: 'Delhi NCR features an extensive cue-sports ecosystem spanning traditional snooker clubs, competitive coaching academies, and multi-game entertainment centers in areas like Connaught Place, South Extension, Noida, and Gurgaon. In high-traffic venues, operators benefit from synchronized multi-table timers, tournament bracket scheduling, advance slot booking, and clear member credit management to manage group reservations effectively.',
    rateRange: '₹200 – ₹550 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Tournament Snooker, 9-Ball Pool, Multi-Station Gaming Arenas',
    operationalProfile: {
      peakHours: 'Operators commonly plan peak staffing for evening hours (approx. 5:30 PM – 11:30 PM) and sustained weekend occupancy',
      clothGuidance: 'Tournament-grade wool (such as Strachan or Hainsworth grades) for match tables; heavy-duty blends for practice tables',
      typicalVenueMix: 'Typically 4–10 snooker tables, pool tables, and dedicated lounge or snack counter',
    },
  },
  {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    neighborhoods: ['Koregaon Park', 'Baner', 'Kothrud', 'Viman Nagar', 'Hinjawadi', 'Wakad', 'FC Road', 'Aundh', 'Hadapsar'],
    localContext: 'With an active student demographic and major IT and automotive corridors in Hinjawadi, Viman Nagar, and Baner, Pune provides steady demand for indoor recreation and cue sports. Venues catering to university students and corporate professionals can utilize flexible hourly or frame-based rate structures, automated block rounding, and rapid UPI QR checkout to keep counter transactions efficient during peak hours.',
    rateRange: '₹150 – ₹350 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Snooker, 8-Ball Pool, Table Tennis & Canteen Service',
    operationalProfile: {
      peakHours: 'Operators generally observe afternoon student play followed by evening post-work traffic (approx. 5:00 PM – 11:00 PM)',
      clothGuidance: 'Durable club-grade wool blend cloth for recreational tables; tournament-grade felt for dedicated snooker tables',
      typicalVenueMix: 'Typically 3–6 tables combining snooker and pool with beverage counter',
    },
  },
  {
    slug: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    neighborhoods: ['Park Street', 'Salt Lake (Sector V)', 'New Town', 'Ballygunge', 'Bhawanipur', 'Alipore', 'Gariahat', 'Howrah'],
    localContext: 'Kolkata has a respected heritage in cue sports and English billiards, alongside modern leisure and gaming venues emerging in commercial sectors like Salt Lake Sector V and New Town. For venues operating community-focused or member-based facilities, digital credit ledgers and advance balance management replace paper registers, providing operators with reliable records of customer tabs.',
    rateRange: '₹140 – ₹350 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'English Billiards, Full-Size Snooker, Casual Pool & PC Gaming',
    operationalProfile: {
      peakHours: 'Operators typically plan around late afternoon and evening recreation periods (approx. 4:30 PM – 10:30 PM)',
      clothGuidance: 'Standard English wool for billiards and snooker; regular brushing and climate control recommended during humid seasons',
      typicalVenueMix: 'Typically 3–6 tables with focus on full-size snooker and English billiards alongside counter facilities',
    },
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    neighborhoods: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Raja Park', 'Mansarovar', 'Tonk Road', 'JLN Marg'],
    localContext: 'Jaipur has seen rising interest in youth recreation venues, gaming lounges, and combined cafe-sports concepts across commercial areas such as C-Scheme, Malviya Nagar, and Vaishali Nagar. For spaces combining table play with snack and beverage service, integrated canteen POS functionality allows operators to merge table time and food orders into a single itemized checkout bill.',
    rateRange: '₹120 – ₹280 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Snooker Frame Play, 8-Ball Pool, Cafe-Attached Recreation',
    operationalProfile: {
      peakHours: 'Operators often schedule for afternoon and evening recreational groups (approx. 4:00 PM – 10:30 PM)',
      clothGuidance: 'Durable commercial blended cloth suitable for recreational play and dry regional conditions',
      typicalVenueMix: 'Typically 2–5 tables frequently integrated with cafe seating or light refreshments',
    },
  },
  {
    slug: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    neighborhoods: ['Kakkanad (Infopark)', 'Panampilly Nagar', 'Edappally', 'MG Road', 'Fort Kochi', 'Kaloor', 'Palarivattom'],
    localContext: 'In Kochi, commercial expansion around Kakkanad (Infopark), Edappally, and central business areas has supported interest in indoor sports, gaming lounges, and billiards parlors. Operating in humid coastal conditions, club managers benefit from structured session timers, automated pricing controls, and digital payment workflows that simplify counter management.',
    rateRange: '₹150 – ₹320 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Snooker, 8-Ball Pool, Console & Lounge Gaming',
    operationalProfile: {
      peakHours: 'Operators commonly observe peak activity during evening leisure hours (approx. 5:30 PM – 11:00 PM) and weekends',
      clothGuidance: 'Club-grade cloth with adequate room dehumidification and air conditioning recommended to protect table nap',
      typicalVenueMix: 'Typically 2–5 snooker and pool tables with reception counter and digital payment display',
    },
  },
  {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    neighborhoods: ['SG Highway', 'Prahlad Nagar', 'Bodakdev', 'Navrangpura', 'Satellite', 'Vastrapur', 'Maninagar', 'Sindhu Bhavan Road'],
    localContext: 'Ahmedabad\'s prominent commercial avenues—including SG Highway, Prahlad Nagar, and Sindhu Bhavan Road—host a variety of sports, entertainment, and cafe venues. Snooker and pool parlors in these districts frequently cater to recreational groups and enthusiast players where accurate, transparent timer billing and digital receipts help build customer trust and maintain efficient front-desk operations.',
    rateRange: '₹160 – ₹400 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Tournament Snooker, American Pool, Mocktail / Canteen POS',
    operationalProfile: {
      peakHours: 'Operators typically see higher occupancy during late evening hours (approx. 6:30 PM – 11:30 PM) and weekend sessions',
      clothGuidance: 'High-grade wool for competitive tables; durable nylon-wool blends for commercial pool tables',
      typicalVenueMix: 'Typically 3–7 tables often paired with mocktail, beverage, or quick-service snack counters',
    },
  },
  {
    slug: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab / Haryana',
    neighborhoods: ['Sector 17', 'Sector 35', 'Sector 22', 'Sector 8 & 9 (Inner Market)', 'Mohali (Phase 3B2 & Phase 7)', 'Panchkula (Sector 5 & 11)'],
    localContext: 'Across the Tricity region (Chandigarh, Mohali, and Panchkula), sports and recreation clubs are popular leisure hubs for students and young professionals. For venues hosting casual frame challenges as well as amateur tournaments, features such as 1v1 match settlement (e.g., loser-pays splits), exact-minute calculation, and member credit tracking provide structured administrative support.',
    rateRange: '₹150 – ₹380 / hr (indicative guide; varies by AC, table tier & cloth)',
    popularGames: 'Snooker Match Play, 8-Ball Leagues, Gaming Lounges',
    operationalProfile: {
      peakHours: 'Operators commonly plan staffing for late afternoon and evening recreation (approx. 5:00 PM – 11:00 PM)',
      clothGuidance: 'Standard tournament wool or club-grade felt, maintained with regular table brushing',
      typicalVenueMix: 'Typically 3–6 tables combining full-size snooker and American pool with lounge area',
    },
  },
];

export const cityPages: PageMeta[] = CITIES.map((city) => {
  const slug = `locations/india/${city.slug}`;
  const canonical = `${BASE_URL}/${slug}/`;
  const title = `Snooker Club Management Software in ${city.name} | JustClub`;
  const description = `Cloud snooker club and pool parlor management software for ${city.name}, ${city.state}. Live table timers, loser-pays split billing, canteen POS & instant UPI QR checkout.`;
  const h1 = `Snooker Club Management Software in ${city.name}`;

  return {
    slug,
    title,
    description,
    canonical,
    h1,
    category: 'Local SEO',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Locations', url: `${BASE_URL}/snooker-software-india/` },
        { name: city.name, url: canonical },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Locations', url: `${BASE_URL}/snooker-software-india/` },
        { name: city.name, url: canonical },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Local Club OS • ${city.name}, ${city.state}</span>
        <h1>Snooker Club Management Software in ${city.name}</h1>
        
        <div class="quick-answer">
          <strong>Quick answer:</strong> JustClub provides cue-sports and gaming lounge owners across ${city.name} with cloud table timers, exact-minute pro-rata billing, 1v1 loser-pays match splits, canteen stock POS, and instant UPI QR payments on any smartphone, tablet, or PC without expensive hardware.
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Local Operations</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <p>
          ${city.localContext}
        </p>

        <p>
          Whether operating a boutique 3-table snooker parlor or a large multi-game entertainment arena in ${city.name}, deploying modern <a href="/snooker-software-india/">snooker software in India</a> enables venue managers to eliminate unbilled table minutes, accelerate cashier checkouts, and deliver transparent digital receipts directly to players' phones.
        </p>

        <h2>Operating Dynamics &amp; Guidance for ${city.name} Venues</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Operational Parameter</th>
                <th>Planning Guidance for ${city.name} Operators</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Typical Table Rates</strong></td>
                <td><strong>${city.rateRange}</strong></td>
              </tr>
              <tr>
                <td><strong>Popular Recreation Formats</strong></td>
                <td>${city.popularGames}</td>
              </tr>
              <tr>
                <td><strong>Peak Operating Windows</strong></td>
                <td>${city.operationalProfile.peakHours}</td>
              </tr>
              <tr>
                <td><strong>Primary Settlement Modes</strong></td>
                <td>Instant UPI (GPay, PhonePe, Paytm), cash counter tabs, and regular <a href="/features/ledger/">member khata ledger</a> accounts</td>
              </tr>
              <tr>
                <td><strong>Cloth &amp; Table Standards</strong></td>
                <td>${city.operationalProfile.clothGuidance}</td>
              </tr>
              <tr>
                <td><strong>Typical Venue Configuration</strong></td>
                <td>${city.operationalProfile.typicalVenueMix}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>How JustClub Powers Clubs Across ${city.name}</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>🎱 Multi-Table Timers</h3>
            <p>Run live countdown and stopwatch timers on tournament snooker, French billiards, and 8-ball tables with pause/resume and table-transfer capabilities.</p>
          </div>
          <div class="feature-card">
            <h3>⚡ <a href="/features/table-billing/">Pro-Rata Table Billing</a></h3>
            <p>Settle competitive frames instantly by assigning table charges to the losing player with 1v1 match logic while splitting canteen snacks equally.</p>
          </div>
          <div class="feature-card">
            <h3>📲 <a href="/features/upi-payments/">Dynamic UPI Payments</a></h3>
            <p>Generate exact-amount UPI QR codes on your counter screen or send <a href="/features/whatsapp/">WhatsApp digital receipts</a> with embedded payment links.</p>
          </div>
          <div class="feature-card">
            <h3>📖 <a href="/features/ledger/">Member Khata & Ledger</a></h3>
            <p>Manage running tabs, advance membership deposits, and send 1-click debt settlement reminders via WhatsApp without spreadsheet errors.</p>
          </div>
        </div>

        <h2>Financial Planning & Yield Estimation</h2>
        <p>
          Planning to upgrade table cloth, expand into a new commercial zone in ${city.name}, or open a new parlor? You can estimate your monthly turnover, occupancy thresholds, and break-even points using our interactive financial tools:
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>📊 <a href="/tools/snooker-club-profit-calculator/">Snooker Club Profit Calculator</a></h3>
            <p>Model monthly table revenue, canteen gross margins, rent overhead, and net take-home profit based on local ${city.name} hourly rates.</p>
          </div>
          <div class="feature-card">
            <h3>⚖️ <a href="/tools/snooker-club-break-even-calculator/">Break-Even Estimator</a></h3>
            <p>Calculate the exact daily billable hours per table required to cover 100% of your fixed rent, electricity, and staff overheads.</p>
          </div>
        </div>

        <h2>Key Commercial &amp; Recreation Zones in ${city.name}</h2>
        <p>
          JustClub supports snooker clubs, cue sports lounges, and gaming cafes operating across key commercial, student, and recreation districts in ${city.name}:
        </p>
        <ul>
          ${city.neighborhoods.map((n) => `<li><strong>${n}</strong>: Prominent commercial, retail, or entertainment activity hub in ${city.name}.</li>`).join('\n          ')}
        </ul>

        <div class="faq-section">
          <h2>Frequently Asked Questions in ${city.name}</h2>
          <div class="faq-item">
            <h3>Can I run JustClub on an Android tablet or smartphone at my counter?</h3>
            <p>Yes. JustClub is a lightweight Progressive Web App (PWA) that installs on any Android phone, tablet, iPad, or Windows desktop without requiring expensive POS hardware.</p>
          </div>
          <div class="faq-item">
            <h3>How does JustClub prevent staff pilferage during late-night shifts in ${city.name}?</h3>
            <p>Every session start, pause, rate override, and cancellation is logged with staff timestamps. Shift closing reports match total cash and UPI collections with exact table seconds played.</p>
          </div>
          <div class="faq-item">
            <h3>Can I test JustClub in my ${city.name} club before purchasing?</h3>
            <p>Yes. We offer a full 15-day free trial with unlimited tables, complete features, and zero credit card requirements.</p>
          </div>
        </div>

        <div class="cta-banner">
          <h2>Transform Your ${city.name} Snooker Club</h2>
          <p>Equip your venue with India's dedicated club management platform. Start your 15-day free trial today.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  };
});
