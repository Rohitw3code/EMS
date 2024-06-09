import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./AdminLogin.css"

export default function AdminLogin(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigator = useNavigate();

    const handleSubmit = (event) => {
      event.preventDefault();
      if (username === 'admin' && password === 'admin') {
navigator('/admin');
      } else {
        setError('Invalid username or password');
      }
    };
    
    return (<>
      <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="admin-button">Login</button>
      </form>
    </div>   </>)
}