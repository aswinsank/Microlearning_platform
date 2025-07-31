// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <h1>📚 LearnHub</h1>
          </div>
          <nav className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Master Skills Through 
              <span className="highlight"> Microlearning</span>
            </h1>
            <p className="hero-description">
              A role-based platform where tutors create bite-sized lessons and learners 
              upskill through digestible content. Track progress, compete on leaderboards, 
              and achieve continuous growth.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Start Learning
              </Link>
              <a href="#features" className="btn btn-secondary">
                Explore Features
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">🎯</span>
                <span className="stat-label">Bite-sized Lessons</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">👨‍🏫</span>
                <span className="stat-label">Expert Tutors</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">🏆</span>
                <span className="stat-label">Gamified Learning</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="learning-mockup">
              <div className="progress-ring">
                <div className="progress-circle">
                  <span className="progress-text">75%</span>
                </div>
              </div>
              <div className="content-types">
                <div className="content-pill video">📹 Video</div>
                <div className="content-pill text">📄 Text</div>
                <div className="content-pill quiz">❓ Quiz</div>
              </div>
              <div className="gamification-badge">
                <span>🥇 Level 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Role-Based Learning</h3>
              <p>Separate experiences for tutors to teach and learners to grow, with secure authentication</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧩</div>
              <h3>Modular Content</h3>
              <p>Digestible lessons in multiple formats: videos, text articles, and interactive quizzes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Gamified Experience</h3>
              <p>Progress tracking, achievements, and leaderboards to motivate continuous learning</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Filtering</h3>
              <p>Find content by category, type, or skill level to match your learning goals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Visual dashboards showing learning streaks, completed lessons, and skill advancement</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Healthy Competition</h3>
              <p>Leaderboards and peer comparisons to foster motivation and engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Teaching?</h2>
            <p>Join thousands of educators sharing knowledge through video lessons</p>
            <Link to="/login" className="btn btn-primary btn-large">
              Start Uploading Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;