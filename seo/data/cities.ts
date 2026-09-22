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
}

const CITIES: CityConfig[] = [
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    neighborhoods: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Marathahalli', 'Electronic City', 'JP Nagar', 'Kalyan Nagar', 'Malleshwaram'],
    localContext: 'Bangalore is India’s cue-sports and tech capital, home to legendary state snooker championships and high-density tech worker lounges. Clubs in areas like Koramangala and Indiranagar see intense evening and weekend traffic with strong demand for fast UPI checkout, PS5 gaming crossovers, and beverage POS tabs.',
    rateRange: '₹180 – ₹450 / hr',
    popularGames: 'Tournament Snooker, 8-Ball Pool, PS5 FIFA/Tekken Lounges',
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    neighborhoods: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR (Old Mahabalipuram Road)', 'Porur', 'Tambaram', 'Nungambakkam', 'Kilpauk', 'Mylapore'],
    localContext: 'Chennai boasts a deep heritage in competitive snooker and English billiards. Clubs near OMR and Velachery cater to young software professionals, while classic clubs in T Nagar and Anna Nagar host competitive regular players who demand exact-minute pro-rata billing, AC lounge comforts, and member khata credit tracking.',
    rateRange: '₹150 – ₹380 / hr',
    popularGames: 'English Billiards, Full-Size Tournament Snooker, American Pool',
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
    localContext: 'Hyderabad’s booming Cyberabad corridor has seen premier luxury cue-sports lounges opening in Madhapur and Jubilee Hills. Operators handle late-night sessions, VIP lounge bookings, attached mocktail bars, and high-volume corporate player matches requiring accurate multi-station timing.',
    rateRange: '₹200 – ₹500 / hr',
    popularGames: 'Premium Snooker, VIP Private Pool Rooms, Console Gaming',
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
    localContext: 'Delhi NCR hosts some of the largest snooker academies and multi-game entertainment centers in North India. High-volume venues in Gurgaon and South Delhi require seamless handling of tournament brackets, advance slot booking, and corporate khata accounts.',
    rateRange: '₹200 – ₹550 / hr',
    popularGames: 'Snooker Academies, 9-Ball Pool, Multi-Station PS5 Arenas',
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
  const description = `The #1 snooker club & pool parlor management software in ${city.name}, ${city.state}. Live table timers, loser-pays split, canteen POS & UPI QR checkout.`;
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
          <strong>Quick answer:</strong> JustClub provides cue-sports and gaming lounge owners across ${city.name} with cloud table timers, exact-minute billing, 1v1 loser-pays match splits, canteen stock POS, and instant UPI QR payments on any smartphone, tablet, or PC without expensive hardware.
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Local Operations</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <p>
          ${city.localContext}
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
                <td>Weekday evenings (5:00 PM – 11:30 PM) &amp; full weekends (11:00 AM – Midnight)</td>
              </tr>
              <tr>
                <td><strong>Primary Settlement Modes</strong></td>
                <td>Instant UPI (GPay, PhonePe, Paytm), cash counter tabs, and regular member khata</td>
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
            <h3>⚡ 1v1 Match Loser Settlement</h3>
            <p>Settle competitive frames instantly by assigning table charges to the losing player while splitting canteen snacks equally.</p>
          </div>
          <div class="feature-card">
            <h3>📲 WhatsApp Invoices & UPI</h3>
            <p>Send itemized receipts directly to players' WhatsApp with dynamic UPI deep links for Google Pay and PhonePe.</p>
          </div>
          <div class="feature-card">
            <h3>📖 Member Khata & Ledger</h3>
            <p>Manage running tabs, advance membership deposits, and send 1-click debt settlement reminders via WhatsApp.</p>
          </div>
        </div>

        <h2>Neighborhoods Served in ${city.name}</h2>
        <p>
          JustClub supports snooker clubs, gaming cafes, and billiards parlors operating across key ${city.name} hubs:
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
            <p>Yes! We offer a full 15-day free trial with unlimited tables, complete features, and zero credit card requirements.</p>
          </div>
        </div>

        <div class="cta-banner">
          <h2>Transform Your ${city.name} Snooker Club</h2>
          <p>Join top cue-sports venues in ${city.name} managing tables with speed and precision. Start your 15-day free trial today.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  };
});
