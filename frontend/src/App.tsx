import { useState } from 'react';
import { CreateRFP } from './components/CreateRFP';
import { RFPList } from './components/RFPList';
import { VendorManager } from './components/VendorManager';
import { RFPDetail } from './components/RFPDetail';

type View = 'DASHBOARD' | 'VENDORS' | 'RFP_DETAIL';

function App() {
  const [view, setView] = useState<View>('DASHBOARD');
  const [selectedRFPId, setSelectedRFPId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRFPCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectRFP = (id: string) => {
    setSelectedRFPId(id);
    setView('RFP_DETAIL');
  };

  return (
    <div>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ProcureAI
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={view === 'DASHBOARD' ? '' : 'secondary'}
            onClick={() => setView('DASHBOARD')}
          >
            Dashboard
          </button>
          <button
            className={view === 'VENDORS' ? '' : 'secondary'}
            onClick={() => setView('VENDORS')}
          >
            Vendors
          </button>
        </div>
      </nav>

      {view === 'DASHBOARD' && (
        <>
          <div style={{ marginBottom: '3rem' }}>
            <CreateRFP onSuccess={handleRFPCreated} />
          </div>
          <RFPList onSelectRFP={handleSelectRFP} refreshTrigger={refreshTrigger} />
        </>
      )}

      {view === 'VENDORS' && <VendorManager />}

      {view === 'RFP_DETAIL' && selectedRFPId && (
        <RFPDetail id={selectedRFPId} onBack={() => setView('DASHBOARD')} />
      )}
    </div>
  );
}

export default App;
