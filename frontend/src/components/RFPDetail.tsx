import React, { useEffect, useState } from 'react';
import { getRFP, getComparison, getVendors, sendRFP, simulateResponse } from '../api';

interface RFPDetailProps {
    id: string;
    onBack: () => void;
}

export const RFPDetail: React.FC<RFPDetailProps> = ({ id, onBack }) => {
    const [rfp, setRfp] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [comparing, setComparing] = useState(false);

    // Send RFP State
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<any>(null);

    // Simulate Response State
    const [simulating, setSimulating] = useState(false);
    const [simVendorId, setSimVendorId] = useState('');
    const [simBody, setSimBody] = useState('');

    useEffect(() => {
        loadRFP();
        loadVendors();
    }, [id]);

    const loadRFP = async () => {
        try {
            const data = await getRFP(id);
            setRfp(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadVendors = async () => {
        const data = await getVendors();
        setVendors(data);
    }

    const handleCompare = async () => {
        setComparing(true);
        try {
            const data = await getComparison(id);
            setComparison(data);
        } catch (err) {
            console.error(err);
        } finally {
            setComparing(false);
        }
    }

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await sendRFP(id, selectedVendors);
            setSendResult(res);
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    }

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            await simulateResponse(id, simVendorId, simBody);
            setSimBody('');
            setSimVendorId('');
            loadRFP(); // Reload to see new response
            alert('Response received and parsed!');
        } catch (err) {
            console.error(err);
        } finally {
            setSimulating(false);
        }
    }

    if (!rfp) return <div>Loading...</div>;

    return (
        <div className="glass-card">
            <button className="secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>

            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1>{rfp.title}</h1>
                    <span className="badge">{rfp.status}</span>
                </div>
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Budget</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{rfp.budget || 'Not specified'}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* LEFT COLUMN */}
                <div>
                    {/* 1. Requirements */}
                    <h3>Specs & Requirements</h3>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {JSON.stringify(rfp.structuredData, null, 2)}
                        </pre>
                    </div>

                    {/* 2. Vendor Responses */}
                    <h3>Vendor Responses ({rfp.responses.length})</h3>

                    {rfp.responses.map((resp: any) => (
                        <div key={resp.id} style={{ border: '1px solid var(--glass-border)', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{resp.vendor.name}</div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Raw: {resp.rawContent.substring(0, 100)}...</div>
                            <div style={{ fontSize: '0.8rem', color: '#818cf8' }}>
                                AI Extracted: Price {resp.structuredData?.price}, Delivery {resp.structuredData?.deliveryDate}
                            </div>
                        </div>
                    ))}

                    {rfp.responses.length > 0 && (
                        <button onClick={handleCompare} disabled={comparing} style={{ marginTop: '1rem' }}>
                            {comparing ? 'Analyzing...' : 'Run AI Comparison'}
                        </button>
                    )}

                    {/* 3. Simulate Response Section */}
                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                        <h3>Simulate Incoming Email</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Paste a mock email response from a vendor to test AI parsing.</p>
                        <select value={simVendorId} onChange={e => setSimVendorId(e.target.value)}>
                            <option value="">Select Vendor...</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        <textarea
                            value={simBody}
                            onChange={e => setSimBody(e.target.value)}
                            placeholder="Subject: Re: RFP... We can provide the laptops for $45,000 delivered by next week..."
                            rows={4}
                        />
                        <button className="secondary" onClick={handleSimulate} disabled={!simVendorId || !simBody || simulating}>
                            {simulating ? 'Parsing...' : 'Receive Response'}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    {/* SEND PANEL */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                        <h3>Send to Vendors</h3>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {vendors.map(v => (
                                <div key={v.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        style={{ width: 'auto', margin: 0 }}
                                        checked={selectedVendors.includes(v.id)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedVendors([...selectedVendors, v.id]);
                                            else setSelectedVendors(selectedVendors.filter(id => id !== v.id));
                                        }}
                                    />
                                    <label>{v.name}</label>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSend} disabled={selectedVendors.length === 0 || sending}>
                            {sending ? 'Sending...' : `Send to ${selectedVendors.length} Vendor(s)`}
                        </button>
                        {sendResult && (
                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#34d399' }}>
                                {sendResult.message}
                                {sendResult.results.map((r: any, i: number) => (
                                    <div key={i}><a href={r.previewUrl} target="_blank" style={{ color: '#818cf8' }}>View Email to {r.vendor}</a></div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COMPARISON RESULT */}
                    {comparison && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '1rem' }}>
                            <h3 style={{ color: '#34d399' }}>AI Recommendation</h3>
                            <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '1rem' }}>
                                Winner: {comparison.recommendation}
                            </p>
                            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>{comparison.summary}</p>
                            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                Reasoning: {comparison.reasoning}
                            </p>
                        </div>
                    )}

                    {!comparison && rfp.responses.length > 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '1rem' }}>
                            Run comparison to see AI insights.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
