import React from 'react';
import BrandHeader from '../molecules/BrandHeader';
import FeatureItem from '../molecules/FeatureItem';
import Button from '../atoms/Button';

export default function HeroSection({ onDemoAccess }) {
  return (
    <div className="hero-content">
      <BrandHeader title="SmartCity" tagline="Urban Issue Reporter" />

      <p className="hero-description">
        Report and track urban issues in your city. Together, we can make our community better.
      </p>

      <div className="features-list">
        <FeatureItem
          variant="icon-mint"
          title="Report Issues"
          description="Submit reports about roads, water, electricity, and more"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00796b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />

        <FeatureItem
          variant="icon-blue"
          title="Track Progress"
          description="Monitor the status of reported issues in real-time"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2b6cb0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
        />

        <FeatureItem
          variant="icon-cyan"
          title="Community Driven"
          description="Upvote issues and engage with your community"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00a8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </div>

      <div className="demo-section">
        <span className="demo-title">Quick Demo Access:</span>
        <div className="demo-buttons">
          <Button onClick={() => onDemoAccess('Citizen')}>Demo as Citizen</Button>
          <Button onClick={() => onDemoAccess('Officer')}>Demo as Officer</Button>
          <Button onClick={() => onDemoAccess('Admin')}>Demo as Admin</Button>
        </div>
      </div>
    </div>
  );
}