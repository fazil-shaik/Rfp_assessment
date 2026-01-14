import React, { useState } from 'react';
import { createRFP } from '../api';

interface CreateRFPProps {
    onSuccess: () => void;
}

export const CreateRFP: React.FC<CreateRFPProps> = ({ onSuccess }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createRFP(text);
            setText('');
            onSuccess();
        } catch (err) {
            setError('Failed to create RFP. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            <h2 style={{ marginBottom: '1rem' }}>Create New RFP</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Describe what you need to procure. For example: "I need 20 laptops with 16GB RAM and 15 monitors delivered by next month. Budget is $50k."
            </p>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe your requirements..."
                    rows={5}
                    style={{ width: '100%', marginBottom: '1rem' }}
                    disabled={loading}
                />

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

                <div className="flex justify-between items-center">
                    <span>{loading ? 'AI is processing your request...' : ''}</span>
                    <button type="submit" disabled={loading || !text.trim()}>
                        {loading ? 'Processing...' : 'Create RFP'}
                    </button>
                </div>
            </form>
        </div>
    );
};
