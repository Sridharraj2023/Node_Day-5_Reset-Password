import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './styles/App.css'; // Import global CSS

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/" element={<ForgotPassword />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;


