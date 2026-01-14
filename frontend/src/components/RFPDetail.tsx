import React, { useEffect, useState } from 'react';
import { getRFP, getComparison } from '../api';

interface RFPDetailProps {
    id: string;
    onBack: () => void;
}

export const RFPDetail: React.FC<RFPDetailProps> = ({ id, onBack }) => {
    const [rfp, setRfp] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [comparing, setComparing] = useState(false);

    useEffect(() => {
        loadRFP();
    }, [id]);

    const loadRFP = async () => {
        try {
            const data = await getRFP(id);
            setRfp(data);
        } catch (err) {
            console.error(err);
        }
    };

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
                <div>
                    <h3>Specs & Requirements</h3>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {JSON.stringify(rfp.structuredData, null, 2)}
                        </pre>
                    </div>

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
                </div>

                <div>
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
