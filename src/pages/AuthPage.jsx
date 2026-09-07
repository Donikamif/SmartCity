import React from 'react';
import AuthTemplate from '../templates/AuthTemplate';
import HeroSection from '../components/organisms/HeroSection';
import LoginCard from '../components/organisms/LoginCard';

export default function AuthPage({ onDemoAccess }) {
  return (
    <AuthTemplate
      hero={<HeroSection onDemoAccess={onDemoAccess} />}
      card={<LoginCard />}
    />
  );
}