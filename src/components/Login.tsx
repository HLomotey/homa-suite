import React, { useState } from 'react';
import { supabase } from '../integration/supabase/client';

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
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;