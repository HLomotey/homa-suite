import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                console.error('Supabase login error:', error); // Log error for debugging
            } else {
                // ...handle successful login...
            }
            console.log('Supabase login response:', { data, error }); // Log response for debugging
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.");
            console.error('Unexpected login error:', err); // Log unexpected errors
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;