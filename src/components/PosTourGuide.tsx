import React, { useEffect, useRef, useCallback } from 'react';
import { driver, Driver } from 'driver.js';
import { NavTab } from './Sidebar';
import { api } from '../services/api';

export interface PosTourGuideProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  onTourFinish?: () => void;
  posTourViews?: number;
  autoStart?: boolean;
}

export const PosTourGuide: React.FC<PosTourGuideProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onTourFinish,
  posTourViews = 0,
  autoStart = false,
}) => {
  const driverRef = useRef<Driver | null>(null);
  const currentTabRef = useRef<NavTab>(currentTab);
  currentTabRef.current = currentTab;

  const handleDismissAll = useCallback(async () => {
    try {
      await api.club.recordWalkthroughProgress('dismiss_all');
    } catch (e) {
      console.warn('Failed to dismiss tour in backend, updating local state', e);
    }
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    if (onTourFinish) onTourFinish();
  }, [onTourFinish]);

  const attachDismissButton = useCallback(() => {
    setTimeout(() => {
      const footer = document.querySelector('.driver-popover-footer');
      if (footer && !footer.querySelector('.driver-popover-dismiss-btn')) {
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'driver-popover-dismiss-btn';
        dismissBtn.innerText = "Don't show again";
        dismissBtn.title = "Never show this walkthrough automatically";
        dismissBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDismissAll();
        };
        footer.insertBefore(dismissBtn, footer.firstChild);
      }
    }, 50);
  }, [handleDismissAll]);

  const startTour = useCallback(() => {
    // If user is currently on another tab, start by switching to tables
    if (currentTabRef.current !== 'tables') {
      onSelectTab('tables');
    }

    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }

    const popoverClass = isDarkMode ? 'justclub-tour-popover' : 'justclub-tour-popover-light';

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: isDarkMode ? '#000000' : '#0f172a',
      overlayOpacity: isDarkMode ? 0.75 : 0.6,
      stagePadding: 6,
      stageRadius: 14,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done / Finish',
      popoverClass,
      onPopoverRender: () => {
        attachDismissButton();
      },
      onDestroyed: () => {
        // Record increment view count on finish or close
        api.club.recordWalkthroughProgress('increment').catch(() => {});
        if (onTourFinish) onTourFinish();
      },
      steps: [
        // STEP 1: Live Status Header
        {
          element: '#pos-header-status',
          popover: {
            title: '⚡ Live Shift Status & HUD',
            description: 'Monitor your club name, tenant subscription active status, real-time table occupancy, and outstanding customer ledger dues at a glance.',
            side: 'bottom',
            align: 'start'
          }
        },
        // STEP 2: Sync Indicator
        {
          element: '#pos-sync-indicator',
          popover: {
            title: '☁️ Offline-First & Cloud Sync',
            description: 'Your JustClub POS works 100% offline! Changes are saved safely in local storage and instantly synced with Cloudflare D1 when online.',
            side: 'bottom',
            align: 'end'
          }
        },
        // STEP 3: Navigation Tabs
        {
          element: '#sidebar-nav-tabs',
          popover: {
            title: '🧭 Instant Module Navigation',
            description: 'Effortlessly switch between Active Tables, Audit Bills, Bar POS, Customer Ledgers (Khata), Analytics Reports, and System Setup.',
            side: 'right',
            align: 'start'
          }
        },
        // STEP 4: Live Tables Summary
        {
          element: '#tables-summary-metrics',
          popover: {
            title: '📊 Real-time Table Metrics',
            description: 'View live club occupancy percentages and the running ticker revenue from all currently active game sessions.',
            side: 'bottom',
            align: 'center'
          }
        },
        // STEP 5: Category Filters
        {
          element: '#tables-category-filter',
          popover: {
            title: '🎱 Asset Category Filtering',
            description: 'Filter your snooker, pool, carrom, PS5, and VR assets instantly by category or tap All to view every station.',
            side: 'bottom',
            align: 'start'
          }
        },
        // STEP 6: Starting a Table Session
        {
          element: '#available-table-card',
          popover: {
            title: '🟢 Start a Match Session',
            description: 'Tap any green "Available" card to start a game timer. Select Solo, 1v1, or 2v2 modes and assign players from your customer list.',
            side: 'top',
            align: 'center'
          }
        },
        // STEP 7: Live Session Meter & Timer
        {
          element: '#active-table-card',
          popover: {
            title: '⏱️ Live Elapsed Timer & Cost',
            description: 'While a table is occupied, JustClub calculates elapsed duration and billed costs in real-time according to your club’s rate config.',
            side: 'top',
            align: 'center'
          }
        },
        // STEP 8: Split Checkout & Snacks
        {
          element: '#active-table-card',
          popover: {
            title: '🧾 Split Billing & Snack Orders',
            description: 'Add beverage snacks directly to an active table tab, or tap "End & Split" to split the final bill evenly between players or charge to individual customer ledgers.',
            side: 'top',
            align: 'center'
          }
        },
        // STEP 9: Switch to Bar POS
        {
          element: '#bar-pos-catalog',
          popover: {
            title: '🍹 Quick Standalone Bar POS',
            description: 'Tap items on the menu grid to instantly build orders for beverages, snacks, hookah, or combos for walk-in lounge guests.',
            side: 'right',
            align: 'start'
          },
          onHighlightStarted: () => {
            if (currentTabRef.current !== 'bar_pos') {
              onSelectTab('bar_pos');
            }
          }
        },
        // STEP 10: Bar Cart & UPI Checkout
        {
          element: '#bar-pos-cart',
          popover: {
            title: '💳 Rapid UPI & Khata Settlement',
            description: 'Review the cart, tag a registered member if desired, choose Cash, UPI (with instant QR code generation), or Ledger, and print or WhatsApp receipts.',
            side: 'left',
            align: 'start'
          }
        },
        // STEP 11: Switch to Ledgers (Khata) & Debt Recovery
        {
          element: '#ledger-debt-summary',
          popover: {
            title: '📒 Customer Khata & Udhaar Tracking',
            description: 'Track all customer credit, pending receivables, and prepaid advance balances. Filter debtors and send one-tap WhatsApp payment links with secure UPI QR codes.',
            side: 'bottom',
            align: 'center'
          },
          onHighlightStarted: () => {
            if (currentTabRef.current !== 'ledgers') {
              onSelectTab('ledgers');
            }
          }
        }
      ]
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [isDarkMode, onSelectTab, onTourFinish, attachDismissButton]);

  // Expose tour starter globally so any button or menu can trigger it
  useEffect(() => {
    (window as any).__JUSTCLUB_START_TOUR__ = startTour;
    return () => {
      delete (window as any).__JUSTCLUB_START_TOUR__;
    };
  }, [startTour]);

  // Auto-start only if eligible (views < 3) and autoStart is true
  useEffect(() => {
    if (autoStart && posTourViews < 3) {
      const timer = setTimeout(() => {
        startTour();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [autoStart, posTourViews, startTour]);

  return null;
};
