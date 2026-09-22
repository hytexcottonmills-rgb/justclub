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

export const toolPages: PageMeta[] = [
  // 1. Snooker Club Profit Calculator
  {
    slug: 'tools/snooker-club-profit-calculator',
    title: 'Snooker Club Profit Calculator: Estimate Monthly Earnings | JustClub',
    description: 'Free interactive snooker club profit calculator for India. Estimate monthly table earnings, canteen gross margin, operating expenses & net ROI.',
    canonical: `${BASE_URL}/tools/snooker-club-profit-calculator/`,
    h1: 'Interactive Snooker Club Profit & Monthly Revenue Calculator',
    category: 'Calculators',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/tools/snooker-club-profit-calculator/#webpage`,
        url: `${BASE_URL}/tools/snooker-club-profit-calculator/`,
        name: 'Snooker Club Profit Calculator',
        description: 'Interactive profit and monthly ROI calculator for snooker and billiards lounges in India.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/tools/snooker-club-profit-calculator/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Tools', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
        { name: 'Profit Calculator', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Tools', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
        { name: 'Profit Calculator', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Business Tool</span>
        <h1>Interactive Snooker Club Profit & Monthly Revenue Calculator</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> Use this interactive business calculator to model your snooker club's monthly gross revenues, operating overheads (rent, electricity, staff, cloth maintenance), canteen sales, and net monthly take-home profit in Indian Rupees (₹).
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Business Advisory</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <!-- Interactive Calculator Widget -->
        <div class="calc-box" id="profit-calc-widget">
          <h2 style="margin-top:0; color:#ffffff; font-size:1.3rem;">Calculate Your Club's Monthly Profit</h2>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1.25rem;">
            <div class="calc-form-group">
              <label for="num-tables">Number of Tables</label>
              <input type="number" id="num-tables" class="calc-input" value="4" min="1" max="25" />
            </div>

            <div class="calc-form-group">
              <label for="hourly-rate">Avg Hourly Rate (₹/hr)</label>
              <input type="number" id="num-rate" class="calc-input" value="220" min="50" max="1500" />
            </div>

            <div class="calc-form-group">
              <label for="hours-played">Occupancy (Hours/Table/Day)</label>
              <input type="number" id="num-hours" class="calc-input" value="6.5" min="1" max="18" step="0.5" />
            </div>

            <div class="calc-form-group">
              <label for="canteen-rev">Daily Canteen Sales (₹/Day)</label>
              <input type="number" id="num-canteen" class="calc-input" value="1200" min="0" max="20000" />
            </div>

            <div class="calc-form-group">
              <label for="monthly-rent">Monthly Rent & Maintenance (₹)</label>
              <input type="number" id="num-rent" class="calc-input" value="50000" min="0" max="500000" />
            </div>

            <div class="calc-form-group">
              <label for="monthly-staff">Staff Salaries & AC Power (₹)</label>
              <input type="number" id="num-staff" class="calc-input" value="35000" min="0" max="300000" />
            </div>
          </div>

          <div class="calc-result-box">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; text-align:center;">
              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Gross Monthly Revenue</span>
                <div id="res-gross" style="font-size:1.6rem; font-weight:900; color:#38bdf8; font-family:monospace; margin-top:0.25rem;">₹2,07,600</div>
              </div>

              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Monthly Operating Cost</span>
                <div id="res-expenses" style="font-size:1.6rem; font-weight:900; color:#f87171; font-family:monospace; margin-top:0.25rem;">₹97,000</div>
              </div>

              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Net Monthly Profit</span>
                <div id="res-net" style="font-size:1.8rem; font-weight:900; color:#4ade80; font-family:monospace; margin-top:0.25rem;">₹1,10,600</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          (function() {
            function updateCalc() {
              const tables = parseFloat(document.getElementById('num-tables').value) || 0;
              const rate = parseFloat(document.getElementById('num-rate').value) || 0;
              const hours = parseFloat(document.getElementById('num-hours').value) || 0;
              const canteenDaily = parseFloat(document.getElementById('num-canteen').value) || 0;
              const rent = parseFloat(document.getElementById('num-rent').value) || 0;
              const staffElectricity = parseFloat(document.getElementById('num-staff').value) || 0;

              // Monthly Table Revenue = Tables * Rate * Hours * 30 days
              const tableMonthly = tables * rate * hours * 30;
              // Monthly Canteen Sales = CanteenDaily * 30
              const canteenMonthly = canteenDaily * 30;
              const grossRevenue = tableMonthly + canteenMonthly;

              // Canteen COGS estimated at 65% of sale price
              const canteenCost = canteenMonthly * 0.65;
              // Cloth & ball maintenance reserve (~₹1000/table/month)
              const maintenance = tables * 1000;
              const totalExpenses = rent + staffElectricity + canteenCost + maintenance;

              const netProfit = grossRevenue - totalExpenses;

              document.getElementById('res-gross').textContent = '₹' + Math.round(grossRevenue).toLocaleString('en-IN');
              document.getElementById('res-expenses').textContent = '₹' + Math.round(totalExpenses).toLocaleString('en-IN');
              document.getElementById('res-net').textContent = '₹' + Math.round(netProfit).toLocaleString('en-IN');
            }

            const inputs = ['num-tables', 'num-rate', 'num-hours', 'num-canteen', 'num-rent', 'num-staff'];
            inputs.forEach(id => {
              const el = document.getElementById(id);
              if (el) {
                el.addEventListener('input', updateCalc);
              }
            });
            updateCalc();
          })();
        </script>

        <h2>Mathematical Revenue &amp; Expense Formulas</h2>
        <div class="example-box">
          <span class="tag">Standard Formulas</span>
          <p><strong>Monthly Table Revenue</strong> = <code>Tables × Hourly Tariff × Active Hours Per Day × 30 Days</code></p>
          <p><strong>Gross Monthly Revenue</strong> = <code>Table Revenue + Monthly Canteen &amp; Beverage Sales</code></p>
          <p><strong>Net Monthly Profit</strong> = <code>Gross Revenue − (Rent + Electricity + Salaries + Canteen COGS + Table Cloth Depreciation)</code></p>
        </div>

        <h2>Key Levers to Boost Your Club Profitability</h2>
        <ol>
          <li><strong>Increase Daytime Utilization:</strong> Offer off-peak student passes (11:00 AM – 4:00 PM) to convert idle tables into paying sessions.</li>
          <li><strong>Eliminate Unbilled Table Minutes:</strong> Switching from manual notes to JustClub automated timers captures an extra 10–15% in previously lost minutes.</li>
          <li><strong>Boost Canteen Gross Margins:</strong> Stock high-margin cold energy drinks, mocktails, and packaged snacks using integrated POS tabs.</li>
        </ol>

        <div class="cta-banner">
          <h2>Maximize Your Club Profits with JustClub</h2>
          <p>Automate table timers, stop revenue leakage, and track your numbers in real time. Start your 15-day free trial today.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 2. Snooker Table Revenue Calculator
  {
    slug: 'tools/snooker-table-revenue-calculator',
    title: 'Snooker Table Revenue Calculator: Per-Table Yield Estimator | JustClub',
    description: 'Calculate monthly and annual revenue per snooker or pool table based on hourly rates, daily playtime, and peak weekend occupancy in India.',
    canonical: `${BASE_URL}/tools/snooker-table-revenue-calculator/`,
    h1: 'Snooker Table Revenue & Hourly Yield Calculator',
    category: 'Calculators',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/tools/snooker-table-revenue-calculator/#webpage`,
        url: `${BASE_URL}/tools/snooker-table-revenue-calculator/`,
        name: 'Snooker Table Revenue Calculator',
        description: 'Estimator for single table and multi-table monthly yields in Indian cue sports venues.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/tools/snooker-table-revenue-calculator/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Tools', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
        { name: 'Table Revenue Calculator', url: `${BASE_URL}/tools/snooker-table-revenue-calculator/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Tools', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
        { name: 'Table Revenue Calculator', url: `${BASE_URL}/tools/snooker-table-revenue-calculator/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Table Yield Tool</span>
        <h1>Snooker Table Revenue & Hourly Yield Calculator</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> Estimate how much annual revenue a single snooker table generates based on its hourly tariff and active occupancy rate. Use this data to determine return on investment for adding new tables or upgrading cloth quality.
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Team</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <!-- Interactive Single Table Yield Widget -->
        <div class="calc-box" id="table-yield-widget">
          <h2 style="margin-top:0; color:#ffffff; font-size:1.3rem;">Calculate Single Table Yield</h2>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:1.25rem;">
            <div class="calc-form-group">
              <label for="yield-rate">Hourly Table Rate (₹/hr)</label>
              <input type="number" id="yield-rate" class="calc-input" value="250" min="50" max="1500" />
            </div>

            <div class="calc-form-group">
              <label for="yield-hours">Avg Daily Utilization (Hours/Day)</label>
              <input type="number" id="yield-hours" class="calc-input" value="7" min="1" max="18" step="0.5" />
            </div>

            <div class="calc-form-group">
              <label for="yield-cloth">Cloth Replacement Interval (Months)</label>
              <input type="number" id="yield-cloth" class="calc-input" value="6" min="1" max="24" />
            </div>
          </div>

          <div class="calc-result-box">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; text-align:center;">
              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Daily Revenue</span>
                <div id="res-table-daily" style="font-size:1.6rem; font-weight:900; color:#38bdf8; font-family:monospace; margin-top:0.25rem;">₹1,750</div>
              </div>

              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Monthly Revenue</span>
                <div id="res-table-monthly" style="font-size:1.6rem; font-weight:900; color:#818cf8; font-family:monospace; margin-top:0.25rem;">₹52,500</div>
              </div>

              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Annual Table Yield</span>
                <div id="res-table-annual" style="font-size:1.8rem; font-weight:900; color:#4ade80; font-family:monospace; margin-top:0.25rem;">₹6,30,000</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          (function() {
            function updateYield() {
              const rate = parseFloat(document.getElementById('yield-rate').value) || 0;
              const hours = parseFloat(document.getElementById('yield-hours').value) || 0;

              const daily = rate * hours;
              const monthly = daily * 30;
              const annual = monthly * 12;

              document.getElementById('res-table-daily').textContent = '₹' + Math.round(daily).toLocaleString('en-IN');
              document.getElementById('res-table-monthly').textContent = '₹' + Math.round(monthly).toLocaleString('en-IN');
              document.getElementById('res-table-annual').textContent = '₹' + Math.round(annual).toLocaleString('en-IN');
            }

            ['yield-rate', 'yield-hours', 'yield-cloth'].forEach(id => {
              const el = document.getElementById(id);
              if (el) el.addEventListener('input', updateYield);
            });
            updateYield();
          })();
        </script>

        <div class="cta-banner">
          <h2>Maximize Every Table's Potential</h2>
          <p>Track live table utilization, occupancy stats, and billing pro-rata with JustClub. Start your 15-day free trial.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 3. Break-Even Calculator
  {
    slug: 'tools/snooker-club-break-even-calculator',
    title: 'Snooker Club Break-Even Calculator: Occupancy Analysis | JustClub',
    description: 'Calculate the minimum daily table hours and occupancy percentage needed to cover your snooker club monthly fixed expenses in India.',
    canonical: `${BASE_URL}/tools/snooker-club-break-even-calculator/`,
    h1: 'Snooker Club Break-Even Occupancy Calculator',
    category: 'Calculators',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/tools/snooker-club-break-even-calculator/#webpage`,
        url: `${BASE_URL}/tools/snooker-club-break-even-calculator/`,
        name: 'Snooker Club Break-Even Calculator',
        description: 'Break-even occupancy and daily hours estimator for snooker clubs in India.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/tools/snooker-club-break-even-calculator/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Tools', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
        { name: 'Break-Even Calculator', url: `${BASE_URL}/tools/snooker-club-break-even-calculator/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Tools', url: `${BASE_URL}/tools/snooker-club-profit-calculator/` },
        { name: 'Break-Even Calculator', url: `${BASE_URL}/tools/snooker-club-break-even-calculator/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Risk & Planning Tool</span>
        <h1>Snooker Club Break-Even Occupancy Calculator</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> Determine the exact number of paid hours per table your club needs each day to cover 100% of your fixed costs (rent, salaries, AC electricity, maintenance).
        </div>

        <!-- Interactive Break-Even Calculator Widget -->
        <div class="calc-box" id="breakeven-calc-widget">
          <h2 style="margin-top:0; color:#ffffff; font-size:1.3rem;">Calculate Minimum Break-Even Hours</h2>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:1.25rem;">
            <div class="calc-form-group">
              <label for="be-tables">Number of Tables</label>
              <input type="number" id="be-tables" class="calc-input" value="4" min="1" max="20" />
            </div>

            <div class="calc-form-group">
              <label for="be-rate">Hourly Rate (₹/hr)</label>
              <input type="number" id="be-rate" class="calc-input" value="200" min="50" max="1000" />
            </div>

            <div class="calc-form-group">
              <label for="be-costs">Total Monthly Fixed Costs (₹)</label>
              <input type="number" id="be-costs" class="calc-input" value="80000" min="10000" max="500000" />
            </div>
          </div>

          <div class="calc-result-box">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; text-align:center;">
              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Required Total Daily Hours</span>
                <div id="res-be-total-hours" style="font-size:1.6rem; font-weight:900; color:#38bdf8; font-family:monospace; margin-top:0.25rem;">13.3 hrs</div>
              </div>

              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Hours Needed Per Table / Day</span>
                <div id="res-be-table-hours" style="font-size:1.8rem; font-weight:900; color:#4ade80; font-family:monospace; margin-top:0.25rem;">3.3 hrs</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          (function() {
            function updateBE() {
              const tables = parseFloat(document.getElementById('be-tables').value) || 1;
              const rate = parseFloat(document.getElementById('be-rate').value) || 1;
              const costs = parseFloat(document.getElementById('be-costs').value) || 0;

              // Monthly hours required across all tables = Costs / Rate
              const monthlyHours = costs / rate;
              const dailyTotalHours = monthlyHours / 30;
              const dailyPerTableHours = dailyTotalHours / tables;

              document.getElementById('res-be-total-hours').textContent = dailyTotalHours.toFixed(1) + ' hrs/day';
              document.getElementById('res-be-table-hours').textContent = dailyPerTableHours.toFixed(1) + ' hrs/table';
            }

            ['be-tables', 'be-rate', 'be-costs'].forEach(id => {
              const el = document.getElementById(id);
              if (el) el.addEventListener('input', updateBE);
            });
            updateBE();
          })();
        </script>

        <div class="cta-banner">
          <h2>Surpass Your Break-Even Target with JustClub</h2>
          <p>Optimize your club operations, minimize downtime, and maximize monthly margins. Start your 15-day free trial.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },
];
