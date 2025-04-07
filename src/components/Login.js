import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === "doctor@example.com" && password === "password123") {
            navigate("/dashboard");
        } else {
            setError("❌ Invalid Email or Password");
        }
    };

    return (
        <div className="login-container">
            <h2>🔐 Doctor Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
