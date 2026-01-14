import React, { useEffect, useState } from 'react';
import { getRFPs } from '../api';

interface RFP {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    budget?: string;
    _count?: { responses: number };
}

interface RFPListProps {
    onSelectRFP: (id: string) => void;
    refreshTrigger: number;
}

export const RFPList: React.FC<RFPListProps> = ({ onSelectRFP, refreshTrigger }) => {
    const [rfps, setRFPs] = useState<RFP[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRFPs();
    }, [refreshTrigger]);

    const loadRFPs = async () => {
        setLoading(true);
        try {
            const data = await getRFPs();
            setRFPs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && rfps.length === 0) return <div>Loading RFPs...</div>;

    return (
        <div className="glass-card">
            <h2 style={{ marginBottom: '1rem' }}>Active RFPs</h2>
            {rfps.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No RFPs found. Create one above.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Budget</th>
                            <th>Responses</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rfps.map((rfp) => (
                            <tr key={rfp.id}>
                                <td style={{ fontWeight: 500 }}>{rfp.title}</td>
                                <td>
                                    <span className="badge">{rfp.status}</span>
                                </td>
                                <td>{rfp.budget || '-'}</td>
                                <td>{rfp._count?.responses || 0}</td>
                                <td>{new Date(rfp.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="secondary" onClick={() => onSelectRFP(rfp.id)}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
