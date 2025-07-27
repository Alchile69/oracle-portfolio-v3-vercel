import React from 'react';
import MarketStressCard from '../widgets/MarketStressCard';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#0F172A', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Oracle Portfolio - Test Minimal</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        <MarketStressCard />
      </div>
    </div>
  );
};

export default Dashboard;

