import React, { useState } from "react";
import {
  FaUser,
  FaMobileAlt,
  FaEnvelope,
  FaLock,
  FaUserTag,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    referral_code: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username: formData.username,
        mobile: formData.mobile,
        email: formData.email || null,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        referral_code: formData.referral_code || null,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.mobile?.[0] ||
          err.response?.data?.username?.[0] ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Register</h2>
          <p>Fill in your details to create an account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon"><FaUser /></div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon"><FaMobileAlt /></div>
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              maxLength="10"
              pattern="[0-9]{10}"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon"><FaEnvelope /></div>
            <input
              type="email"
              name="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div className="input-icon"><FaLock /></div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon"><FaLock /></div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              minLength="6"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon"><FaUserTag /></div>
            <input
              type="text"
              name="referral_code"
              placeholder="Referral Code (optional)"
              value={formData.referral_code}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn">
            Register
          </button>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
