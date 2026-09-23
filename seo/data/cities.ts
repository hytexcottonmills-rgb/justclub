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
  operationalProfile?: {
    peakHours: string;
    clothType: string;
    typicalVenueMix: string;
  };
}

const CITIES: CityConfig[] = [
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    neighborhoods: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Marathahalli', 'Electronic City', 'JP Nagar', 'Kalyan Nagar', 'Malleshwaram'],
    localContext: 'Bangalore is India’s major cue-sports and tech innovation capital, home to premier state snooker championships and high-density tech worker entertainment lounges. Clubs in tech hubs like Koramangala, Indiranagar, and HSR Layout see concentrated evening traffic from 6:30 PM to 1:00 AM, with strong demand for fast dynamic UPI QR checkout, pro-rata split billing between colleagues, and integrated cafe snack tabs. Venues in residential areas like Jayanagar and JP Nagar see steady daytime practice sessions on tournament-grade tables.',
    rateRange: '₹180 – ₹450 / hr',
    popularGames: 'Tournament Snooker (12x6), 8-Ball & 9-Ball Pool, PS5 Gaming Lounges',
    operationalProfile: {
      peakHours: 'Weekdays 6:30 PM – 1:00 AM | Weekends 11:00 AM – Midnight',
      clothType: 'Strachan 6811 Tournament & Hainsworth Smart',
      typicalVenueMix: '4–8 Snooker tables, 2–4 Pool tables, attached cafe & console booths',
    },
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    neighborhoods: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR (Old Mahabalipuram Road)', 'Porur', 'Tambaram', 'Nungambakkam', 'Kilpauk', 'Mylapore'],
    localContext: 'Chennai boasts a deep competitive heritage in snooker and English billiards, anchored by historic clubs in Mylapore, T Nagar, and Anna Nagar alongside modern sports lounges along the OMR IT corridor. Given Chennai’s coastal humidity, club operators maintain strict 24/7 air conditioning to protect English wool cloth tension and ball true-roll. Local operators rely heavily on transparent exact-minute billing, staff shift reconciliation, and regular member khata ledgers to manage repeat player credit balance.',
    rateRange: '₹150 – ₹380 / hr',
    popularGames: 'English Billiards, Full-Size Tournament Snooker, American Pool',
    operationalProfile: {
      peakHours: 'Daily 5:00 PM – 11:30 PM | Sunday Full Day (10:00 AM – 11:30 PM)',
      clothType: 'Strachan West of England & 6811 Club',
      typicalVenueMix: '3–6 Snooker tables, 1–2 Billiards tables, Member lounge & canteen',
    },
  },
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    neighborhoods: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saravanampatti', 'Singanallur', 'Ganapathy', 'Saibaba Colony', 'Vadavalli'],
    localContext: 'Coimbatore’s vibrant college student population and industrial entrepreneur community have fueled a rapid expansion of modern snooker and gaming cafes around Peelamedu and Saravanampatti IT parks. Fast group bill-splitting and WhatsApp debt reminders are essential for high-velocity student play.',
    rateRange: '₹120 – ₹300 / hr',
    popularGames: 'Snooker Frames, 8-Ball Pool, Student Group Challenges',
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    neighborhoods: ['Madhapur', 'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Kukatpally', 'Ameerpet', 'Begumpet', 'Dilsukhnagar'],
    localContext: 'Hyderabad’s booming Cyberabad corridor has created high demand for premium cue-sports lounges and multi-station entertainment venues in Madhapur, Gachibowli, Kondapur, and Jubilee Hills. Operators handle late-night sessions stretching past midnight, VIP private table bookings, attached mocktail cafes, and corporate frame tournaments. Transparent on-screen billing and automated WhatsApp receipts help cashiers prevent dispute during high-volume weekend rush periods.',
    rateRange: '₹200 – ₹500 / hr',
    popularGames: 'Full-Size Snooker, VIP Private Pool Rooms, Console Gaming',
    operationalProfile: {
      peakHours: 'Weekdays 7:00 PM – 1:30 AM | Weekends 1:00 PM – 2:00 AM',
      clothType: 'Strachan 6811 & Tournament Wool Blend',
      typicalVenueMix: '4–10 Snooker tables, 3 Pool tables, VIP private rooms, Mocktail bar',
    },
  },
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    neighborhoods: ['Bandra West', 'Andheri West', 'Powai', 'Lower Parel', 'Thane West', 'Navi Mumbai (Vashi & Nerul)', 'Borivali', 'Dadar', 'Juhu'],
    localContext: 'With high real estate costs across Mumbai, table space optimization is critical. Parlors in Andheri and Bandra operate round-the-clock shift rotations. JustClub helps Mumbai club owners eliminate idle table minutes and track tight staff shift handovers with automated revenue audits.',
    rateRange: '₹250 – ₹650 / hr',
    popularGames: 'Fast American Pool, Tournament Snooker, Late-Night Gaming',
  },
  {
    slug: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi / NCR',
    neighborhoods: ['Connaught Place', 'South Extension', 'Hauz Khas', 'Noida Sector 18 & 62', 'Gurgaon Cyber City & Golf Course Road', 'Dwarka', 'Rohini', 'Lajpat Nagar'],
    localContext: 'Delhi NCR hosts some of the largest snooker academies, cue-sports hubs, and multi-game entertainment centers in North India. High-volume venues in South Extension, Connaught Place, Gurgaon Cyber City, and Noida Sector 18 experience intense weekend rushes requiring multi-table synchronization, bracket tournament management, advance slot reservations, and automated corporate khata accounts.',
    rateRange: '₹200 – ₹550 / hr',
    popularGames: 'Snooker Academies, 9-Ball Pool, Multi-Station PS5 Arenas',
    operationalProfile: {
      peakHours: 'Weekdays 5:30 PM – Midnight | Weekends 11:30 AM – Midnight',
      clothType: 'Strachan 6811 Tournament & Hainsworth Precision',
      typicalVenueMix: '5–12 Snooker tables, 2–4 Pool tables, Dedicated coaching arena & snack bar',
    },
  },
  {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    neighborhoods: ['Koregaon Park', 'Baner', 'Kothrud', 'Viman Nagar', 'Hinjawadi', 'Wakad', 'FC Road', 'Aundh', 'Hadapsar'],
    localContext: 'Pune’s unique combination of university campuses and automotive/IT hubs in Hinjawadi creates steady daytime student footfall followed by heavy evening corporate leagues. Automated 15-minute block rounding and fast UPI QR checkout keep queues moving smoothly.',
    rateRange: '₹150 – ₹350 / hr',
    popularGames: 'Snooker, Pool, Table Tennis & Canteen POS',
  },
  {
    slug: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    neighborhoods: ['Park Street', 'Salt Lake (Sector V)', 'New Town', 'Ballygunge', 'Bhawanipur', 'Alipore', 'Gariahat', 'Howrah'],
    localContext: 'Kolkata has a storied billiards club tradition alongside rapidly emerging modern gaming lounges in Salt Lake Sector V. Regular players maintain extensive monthly khata accounts, making JustClub’s digital ledger and advance balance tracking indispensable.',
    rateRange: '₹140 – ₹350 / hr',
    popularGames: 'Traditional English Billiards, Snooker, PC Gaming Booths',
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    neighborhoods: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Raja Park', 'Mansarovar', 'Tonk Road', 'JLN Marg'],
    localContext: 'Jaipur’s cafe culture in C-Scheme and Malviya Nagar frequently features snooker tables alongside specialty coffee shops. JustClub’s integrated canteen POS allows venue owners to combine table time and beverage bills onto a single UPI checkout invoice.',
    rateRange: '₹120 – ₹280 / hr',
    popularGames: 'Snooker Frames, 8-Ball Pool, Cafe-Attached Tables',
  },
  {
    slug: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    neighborhoods: ['Kakkanad (Infopark)', 'Panampilly Nagar', 'Edappally', 'MG Road', 'Fort Kochi', 'Kaloor', 'Palarivattom'],
    localContext: 'Kochi’s IT hub in Kakkanad has driven the growth of weekend cue-sports centers and gaming hubs. Digital WhatsApp invoicing and UPI QR payments offer the modern experience tech workers expect.',
    rateRange: '₹150 – ₹320 / hr',
    popularGames: 'Snooker, 8-Ball Pool, Console Lounges',
  },
  {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    neighborhoods: ['SG Highway', 'Prahlad Nagar', 'Bodakdev', 'Navrangpura', 'Satellite', 'Vastrapur', 'Maninagar', 'Sindhu Bhavan Road'],
    localContext: 'Ahmedabad’s thriving cafe and entertainment scene along Sindhu Bhavan Road and SG Highway features premium snooker clubs that cater to young entrepreneurs and college groups seeking transparent billing and premium table maintenance.',
    rateRange: '₹160 – ₹400 / hr',
    popularGames: 'Tournament Snooker, American Pool, Mocktail Bar POS',
  },
  {
    slug: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab / Haryana',
    neighborhoods: ['Sector 17', 'Sector 35', 'Sector 22', 'Sector 8 & 9 (Inner Market)', 'Mohali (Phase 3B2 & Phase 7)', 'Panchkula (Sector 5 & 11)'],
    localContext: 'The Tricity area (Chandigarh, Mohali, Panchkula) has an active youth sports culture with competitive cue-sports leagues. Clubs benefit from JustClub’s 1v1 loser-pays match settlement and customer credit management.',
    rateRange: '₹150 – ₹380 / hr',
    popularGames: 'Snooker Match Play, 8-Ball Leagues, Gaming Lounges',
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

        <h2>Operating Dynamics for ${city.name} Clubs</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Local Characteristic</th>
                <th>${city.name} Club Ecosystem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Typical Table Rates</strong></td>
                <td><strong>${city.rateRange}</strong> (depending on AC vs Non-AC and table cloth quality)</td>
              </tr>
              <tr>
                <td><strong>Popular Recreation Formats</strong></td>
                <td>${city.popularGames}</td>
              </tr>
              <tr>
                <td><strong>Peak Operating Windows</strong></td>
                <td>${city.operationalProfile ? city.operationalProfile.peakHours : 'Weekday evenings (5:00 PM – 11:30 PM) & full weekends (11:00 AM – Midnight)'}</td>
              </tr>
              <tr>
                <td><strong>Primary Settlement Modes</strong></td>
                <td>Instant UPI (GPay, PhonePe, Paytm), cash counter tabs, and regular <a href="/features/ledger/">member khata ledger</a> accounts</td>
              </tr>
              ${city.operationalProfile ? `
              <tr>
                <td><strong>Cloth & Table Standards</strong></td>
                <td>${city.operationalProfile.clothType}</td>
              </tr>
              <tr>
                <td><strong>Typical Venue Mix</strong></td>
                <td>${city.operationalProfile.typicalVenueMix}</td>
              </tr>
              ` : ''}
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

        <h2>Neighborhoods Served in ${city.name}</h2>
        <p>
          JustClub supports snooker clubs, gaming cafes, and billiards parlors operating across key ${city.name} commercial and recreation hubs:
        </p>
        <ul>
          ${city.neighborhoods.map((n) => `<li><strong>${n}:</strong> Commercial cue sports lounges, university student game zones, and corporate recreation centers.</li>`).join('\n          ')}
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
