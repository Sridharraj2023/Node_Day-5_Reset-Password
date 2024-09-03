import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ForgotPassword.css'; // Import custom CSS

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // Configure Axios to point to the backend server
    const api = axios.create({
        baseURL: 'http://localhost:5000/api', // Update to your backend URL
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/password-reset-request', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'An error occurred.');
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Send Reset Link</button>
                {message && <div className="alert alert-info mt-3">{message}</div>}
            </form>
        </div>
    );
};

export default ForgotPassword;
