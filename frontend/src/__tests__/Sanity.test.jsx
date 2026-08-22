import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

describe('SalesGenie UI Component Sanity Tests', () => {
  it('renders LoadingSkeleton with message', () => {
    render(<LoadingSkeleton message="Loading leads database..." />);
    expect(screen.getByText('SalesGenie AI')).toBeInTheDocument();
    expect(screen.getByText('Loading leads database...')).toBeInTheDocument();
  });

  it('renders Header with navigation tabs', () => {
    render(
      <Header
        activeTab="leads"
        setActiveTab={() => {}}
        onTriggerSync={() => {}}
        isSyncing={false}
        onOpenFastApiConsole={() => {}}
        onOpenCrmSettingsModal={() => {}}
        onOpenNewConversationModal={() => {}}
      />
    );
    expect(screen.getByText('SalesGenie AI')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Outreach')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
