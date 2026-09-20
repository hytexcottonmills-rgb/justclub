import React from 'react';
import { renderToString } from 'react-dom/server';
import { LandingPage } from './components/LandingPage';

export function render(): string {
  const noop = () => {};
  return renderToString(
    <LandingPage
      onStartOnboarding={noop}
      onOpenPosDemo={noop}
      onOpenLogin={noop}
      authUser={null}
      onLogout={noop}
      isDarkMode={true}
    />
  );
}
