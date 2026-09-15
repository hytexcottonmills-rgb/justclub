import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  ScrollText, 
  RefreshCw, 
  Truck, 
  HeartHandshake, 
  Printer, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Building2, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  Clock,
  Phone
} from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'refund' | 'delivery' | 'security' | 'contact';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: PolicyType;
  isDarkMode?: boolean;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policyType,
  isDarkMode = true,
}) => {
  // Manage active tab internally to allow full interactive switching
  const [activeTab, setActiveTab] = useState<PolicyType>(policyType);

  // Sync internal state with prop changes when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(policyType);
    }
  }, [isOpen, policyType]);

  if (!isOpen) return null;

  // Print handler for standard browser compliance
  const handlePrint = () => {
    const printContent = document.getElementById('printable-policy-content');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>JustCLUB Compliance Document</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { font-size: 24px; color: #0f172a; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
              h2, h3, h4 { color: #0f172a; margin-top: 24px; margin-bottom: 8px; }
              p, li { font-size: 14px; margin-bottom: 12px; }
              ul { padding-left: 20px; }
              strong { color: #0f172a; }
              .footer-stamp { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>${selectedPolicyTitle()}</h1>
            <p><strong>Operated by Rajaganapathy Kamalakannan (JustCLUB)</strong></p>
            ${printContent.innerHTML}
            <div class="footer-stamp">
              JustCLUB Compliance Center - Verified Merchant: Rajaganapathy Kamalakannan • Printed on ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  function selectedPolicyTitle() {
    switch (activeTab) {
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms of Service';
      case 'refund': return 'Refund & Cancellation Policy';
      case 'delivery': return 'SaaS Delivery Policy';
      case 'security': return 'Payment Security Policy';
      case 'contact': return 'Contact & Support';
      default: return 'Legal Policy';
    }
  }

  const policies = {
    privacy: {
      eyebrow: 'DATA PROTECTION & PRIVACY',
      title: 'Privacy Policy',
      subtitle: 'Operated by Rajaganapathy Kamalakannan (JustCLUB) • Compliant with DPDP Act 2023 & IT Rules 2011',
      icon: Shield,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <strong>JustCLUB</strong> ("we," "our," or "us"), operated by <strong>Rajaganapathy Kamalakannan</strong>, is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by JustCLUB.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">1. Information We Collect</h4>
          <p>
            We collect information that you provide directly to us when registering a club account, configuring assets, or initiating subscription payments. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Name, business name, work email address, phone number, and physical billing address.</li>
            <li><strong>Business & Invoicing Data:</strong> Payment transactions processed via our payment gateway partner, Cashfree. Please note that we do not store your raw credit/debit card numbers or UPI PINs on our servers.</li>
            <li><strong>Transactional Content:</strong> Customer names, visit logs, game configurations, asset rates, and inventory ledger items entered into your club POS.</li>
            <li><strong>Technical Metadata:</strong> IP addresses, browser user-agent, session timestamps, and diagnostic error logs for system uptime and fraud prevention.</li>
          </ul>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">2. How We Use Your Data</h4>
          <p> Your data is processed strictly for legitimate operational purposes: </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To operate, maintain, and provision your dedicated multi-game club billing workspace.</li>
            <li>To verify your identity and prevent fraudulent activities or unauthorized account access.</li>
            <li>To process secure subscription payments securely through RBI-authorized payment aggregator <strong>Cashfree Payments India Private Limited</strong>.</li>
            <li>To send critical system notifications, billing alerts, and support responses.</li>
          </ul>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">3. Data Sharing and Third-Party Services</h4>
          <p>
            We do not sell, rent, or trade your personal or operational data to third parties. We share transaction-specific data only with our trusted payment processor partner, <strong>Cashfree</strong>, for the sole purpose of secure checkout processing. All communication with our partners is secured using industrial-grade HTTPS/TLS encryption.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">4. Data Retention & Security</h4>
          <p>
            Your database records are protected with secure cloud parameters and modern access keys. Data is retained for as long as your account remains active. You can request deletion of your account and related database entries at any time by contacting us.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">5. Contact Information</h4>
          <p>
            For any queries regarding this Privacy Policy, please contact:<br />
            <strong>Operator:</strong> Rajaganapathy Kamalakannan<br />
            <strong>Email:</strong> hytexcottonmills@gmail.com
          </p>
        </div>
      ),
    },
    terms: {
      eyebrow: 'USER AGREEMENT',
      title: 'Terms of Service',
      subtitle: 'Operated by Rajaganapathy Kamalakannan (JustCLUB) • Effective as of September 15, 2026',
      icon: ScrollText,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Welcome to <strong>JustCLUB</strong>. These Terms of Service ("Terms") govern your use of the JustCLUB application and platform operated by <strong>Rajaganapathy Kamalakannan</strong>. By accessing our services, you agree to comply with these terms.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">1. Use of Service</h4>
          <p>
            JustCLUB is a cloud-based multi-tenant Software-as-a-Service (SaaS) tool designed to manage multi-game club operations, session timing, and cafe inventories. You must use the service only for lawful business purposes in compliance with all local guidelines.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">2. Account Registration & Security</h4>
          <p>
            To use the POS and asset configuration modules, you must register an account using Google SSO or email credentials. You are solely responsible for keeping your login credentials confidential and secure. Any activity occurring under your account is your responsibility.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">3. Fees & Subscription Plans</h4>
          <p>
            JustCLUB offers Monthly, Quarterly, and Yearly subscription packages. A 15-Day Free Trial is granted to new venues. After the trial period, you must select and activate a paid plan using our integration with Cashfree to retain active write-access to POS controls.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">4. Termination</h4>
          <p>
            We reserve the right to suspend or terminate your account access if any terms are violated, or in cases of non-payment. Upon cancellation, your database records will be preserved for up to 30 days, allowing you to export reports.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">5. Limitation of Liability</h4>
          <p>
            JustCLUB is provided "as is" and "as available" without warranties of any kind. Under no circumstances shall Rajaganapathy Kamalakannan or JustCLUB be liable for any indirect, incidental, or loss of revenue damages resulting from service downtime or ledger errors.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">6. Governing Law</h4>
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu, India.
          </p>
        </div>
      ),
    },
    refund: {
      eyebrow: 'REFUNDS & CANCELLATIONS',
      title: 'Refund & Cancellation Policy',
      subtitle: 'Operated by Rajaganapathy Kamalakannan (JustCLUB) • Safe & Simple Guarantee',
      icon: RefreshCw,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            At <strong>JustCLUB</strong> (operated by <strong>Rajaganapathy Kamalakannan</strong>), customer satisfaction is our top priority. Because we want you to be fully confident in your investment, we offer a risk-free <strong>15-Day Free Trial</strong> for all new club registrations.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">1. Trial and Cancellation</h4>
          <p>
            You can evaluate all POS features and asset management modules for 15 days completely free of charge. No payment credentials or credit cards are required to start your trial. You can cancel your subscription at any time during this trial period with zero charges.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">2. Paid Subscriptions & Refunds</h4>
          <p>
            Once you choose to transition to a paid plan (Monthly, Quarterly, or Yearly) and authorize payment via our secure Cashfree checkout, the fees are billed in advance. Due to the digital nature of SaaS delivery, payments are generally non-refundable after successful activation.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">3. Exceptional Refund Requests</h4>
          <p>
            If you believe there was a billing error or an accidental charge, you may reach out to us within <strong>48 hours</strong> of the transaction. Approved refund requests are processed immediately, and the funds will reflect in your original payment method (bank account, credit card, or UPI wallet) within <strong>5 to 7 business days</strong> as per Cashfree standards.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">4. Contact Support</h4>
          <p>
            For cancellation assistance or refund requests, please email <strong>hytexcottonmills@gmail.com</strong> with your transaction reference ID.
          </p>
        </div>
      ),
    },
    delivery: {
      eyebrow: 'INSTANT DIGITAL FULFILLMENT',
      title: 'SaaS Delivery Policy',
      subtitle: 'Operated by Rajaganapathy Kamalakannan (JustCLUB) • 100% Cloud Provisioning',
      icon: Truck,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Since <strong>JustCLUB</strong> is a 100% cloud-based Software-as-a-Service (SaaS) platform, there are no physical goods or items shipped during onboarding or subscription upgrades.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">1. Fulfillment Timeline</h4>
          <p>
            <strong>Instant Provisioning:</strong> Upon successful account creation, your dedicated multi-tenant cloud workspace and club dashboard are provisioned instantly. You will receive active access to register tables, console stations, and product catalogs right away.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">2. Paid Subscription Upgrades</h4>
          <p>
            When you complete a paid subscription checkout (Monthly, Quarterly, or Yearly) via the Cashfree payment gateway, your club workspace writes limits and billing modules are immediately updated. The delivery is complete when the system flags your workspace as <strong>TENANT ACTIVE</strong>.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">3. Confirmation Emails</h4>
          <p>
            A payment confirmation receipt along with billing details is automatically dispatched to your registered email address (e.g., <strong>hytexcottonmills@gmail.com</strong>) immediately upon payment verification by Cashfree.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">4. Delivery Issues</h4>
          <p>
            In the highly unlikely event that your system does not update to "Tenant Active" within 15 minutes of payment authorization, please email us with your payment receipt at <strong>hytexcottonmills@gmail.com</strong>. We will manually provision your workspace within 2 business hours.
          </p>
        </div>
      ),
    },
    security: {
      eyebrow: 'INDUSTRIAL SECURE PAYMENTS',
      title: 'Payment Security Policy',
      subtitle: 'Powered by RBI-Regulated Cashfree Payments • PCI-DSS Certified',
      icon: HeartHandshake,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Your payment security is our top priority. <strong>JustCLUB</strong> utilizes modern industry-standard protocols to ensure that every transaction you make is completely safe, encrypted, and secure.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">1. Payment Processing with Cashfree</h4>
          <p>
            All subscription payments (Monthly, Quarterly, and Yearly plans) are processed securely through <strong>Cashfree Payments India Private Limited</strong>, a highly trusted, RBI-regulated payment gateway. Cashfree complies with the highest level of Payment Card Industry Data Security Standard (PCI-DSS) security.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">2. Industry-Standard Encryption</h4>
          <p>
            Every transaction is encrypted in transit using 256-bit Secure Sockets Layer (SSL) / TLS technology. This guarantees that your financial data (including bank card details, net banking credentials, and UPI authorizations) cannot be intercepted or read by any third party.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">3. Zero Data Storage Guarantee</h4>
          <p>
            At JustCLUB, we practice strict security boundaries. We do not store, log, or have access to any of your raw financial credentials. Your credit card numbers, debit card expiry dates, CVVs, net banking passwords, or UPI PINs never touch our servers.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">4. Additional Security Layers</h4>
          <p>
            All payment methods on Cashfree require multi-factor authentication (such as OTP verification or secure UPI mobile app PIN confirmation) to guarantee that payments are initiated only by authorized users.
          </p>
        </div>
      ),
    },
    contact: {
      eyebrow: 'CUSTOMER SUPPORT HELPDESK',
      title: 'Contact & Support',
      subtitle: 'Operated by Rajaganapathy Kamalakannan (JustCLUB) • 24/7 Availability Tracker',
      icon: Mail,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            We are here to assist you. If you have any questions, operational issues, custom setup inquiries, or subscription disputes, please get in touch using any of the channels below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>Primary Email</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">For overall support requests, billing queries, and feedback:</p>
              <a href="mailto:hytexcottonmills@gmail.com" className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline block break-all">
                hytexcottonmills@gmail.com
              </a>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Support Hours</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Our administrative support team is available online:</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                9:00 AM to 6:00 PM IST<br />
                <span className="text-slate-400 font-normal">Monday to Saturday</span>
              </p>
            </div>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">1. SLA Response Guarantee</h4>
          <p>
            All critical support requests logged via email will receive a diagnostic response within **2 to 4 business hours**. General billing and subscription requests are resolved within 24 business hours.
          </p>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4">2. Escalation & Feedback</h4>
          <p>
            If you do not receive a resolution within the specified timeline, you may escalate your ticket directly to the operator, Rajaganapathy Kamalakannan, by mentioning "ESCALATION" in the email subject line.
          </p>
        </div>
      ),
    },
  };

  const currentPolicy = policies[activeTab];
  const ActiveIcon = currentPolicy.icon;

  const sidebarItems: { type: PolicyType; label: string; icon: React.FC<any> }[] = [
    { type: 'terms', label: 'Terms of Service', icon: ScrollText },
    { type: 'privacy', label: 'Privacy Policy', icon: Shield },
    { type: 'refund', label: 'Refunds & Returns', icon: RefreshCw },
    { type: 'delivery', label: 'SaaS Delivery', icon: Truck },
    { type: 'contact', label: 'Contact & Support', icon: Mail },
    { type: 'security', label: 'Payment Security', icon: HeartHandshake },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[85vh] overflow-hidden border transition-all ${
        isDarkMode 
          ? 'bg-[#0a0f1d] text-slate-100 border-slate-800' 
          : 'bg-white text-slate-800 border-slate-200'
      }`}>
        
        {/* Top Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  JustCLUB Legal & Compliance Center
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded border border-indigo-500/30 text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40">
                  VERIFIED MERCHANT
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Compliant with RBI, IT Act 2000, DPDP Act & Payment Aggregator Standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Document"
              className={`p-2 rounded-xl transition ${
                isDarkMode 
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Printer className="w-4 h-4 sm:w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                isDarkMode 
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              <X className="w-4 h-4 sm:w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Column Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar */}
          <div className={`w-full md:w-72 p-5 flex flex-col justify-between shrink-0 overflow-y-auto gap-4 md:border-r ${
            isDarkMode ? 'border-slate-800/80 bg-[#070a14]' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <div className="space-y-4">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-1">
                LEGAL DISCLOSURES
              </div>
              <nav className="space-y-1.5">
                {sidebarItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => setActiveTab(item.type)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        isActive
                          ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                          : isDarkMode
                            ? 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 opacity-60'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Merchant Identity Card */}
            <div className={`p-4 rounded-xl text-xs space-y-3 mt-4 border ${
              isDarkMode 
                ? 'bg-slate-950/50 border-slate-800/60' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                <span>Merchant Identity</span>
              </div>
              <div className="space-y-1">
                <div className={`font-black text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Rajaganapathy Kamalakannan
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Individual Operator (Brand: JustCLUB)
                </p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                  100% Digital Cloud Service
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Tamil Nadu, India
                </p>
              </div>
              <div className={`pt-2 border-t flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Cashfree Verified Merchant</span>
              </div>
            </div>
          </div>

          {/* Right Content Pane */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Document Title Header */}
            <div className={`px-6 sm:px-8 py-5 border-b shrink-0 ${
              isDarkMode ? 'border-slate-800/80 bg-[#0a0f1d]' : 'border-slate-50 bg-white'
            }`}>
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                {currentPolicy.eyebrow}
              </span>
              <h2 className={`text-xl sm:text-2xl font-black mt-1 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {currentPolicy.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-1">
                {currentPolicy.subtitle}
              </p>
            </div>

            {/* Document Body (Scrollable) */}
            <div 
              id="printable-policy-content"
              className={`flex-1 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar leading-relaxed ${
                isDarkMode ? 'bg-[#080d19]' : 'bg-slate-50/20'
              }`}
            >
              {currentPolicy.content}
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${
          isDarkMode ? 'border-slate-800/80 bg-[#070a14]' : 'border-slate-100 bg-slate-50/30'
        }`}>
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] sm:text-xs">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
              256-Bit SSL Secured
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              Cashfree Gateway Compliant
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-950 dark:bg-slate-900 text-white font-extrabold text-xs tracking-wide hover:bg-slate-800 dark:hover:bg-slate-800 transition shadow-lg"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
