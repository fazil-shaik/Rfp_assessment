import React, { useEffect, useState } from 'react';
import { createVendor, getVendors } from '../api';

interface Vendor {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export const VendorManager: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        try {
            const data = await getVendors();
            setVendors(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email) {
            setError('Name and Email are required');
            return;
        }

        try {
            await createVendor({ name, email, phone });
            setName('');
            setEmail('');
            setPhone('');
            loadVendors();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add vendor');
        }
    };

    return (
        <div className="glass-card">
            <h2 style={{ marginBottom: '1rem' }}>Vendor Management</h2>

            <form onSubmit={handleAdd} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Add New Vendor</h3>
                <div className="grid grid-cols-2">
                    <input
                        placeholder="Vendor Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <input
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        placeholder="Phone (optional)"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>
                {error && <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>{error}</div>}
                <button type="submit" style={{ marginTop: '1rem' }}>Add Vendor</button>
            </form>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Existing Vendors</h3>
            {vendors.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No vendors found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((v) => (
                            <tr key={v.id}>
                                <td>{v.name}</td>
                                <td>{v.email}</td>
                                <td>{v.phone || '-'}</td>
                                <td>-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
