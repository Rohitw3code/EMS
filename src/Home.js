import React from "react";
import "./Home.css";
import ParticlesBg from "particles-bg";

function Home() {
  return (
    <div>
      <header id="home">
        <ParticlesBg type="circle" bg={true} />

        <nav id="nav-wrap">
          <a className="mobile-btn" href="#nav-wrap" title="Show navigation">
            Show navigation
          </a>
          <a className="mobile-btn" href="#home" title="Hide navigation">
            Hide navigation
          </a>

          <ul id="nav" className="nav">
            <li className="current">
              <a href="#home">
                Home
              </a>
            </li>
            <li>
              <a href="/admin-login" className="smoothscroll">Admin</a>
            </li>
          </ul>
        </nav>

        <div className="row banner">
          <div className="banner-text">
            <h1 className="responsive-headline">Exam Monitoring System</h1>
            <h3 style={{ color: "black" }}>Track Student Exam</h3>
            <hr />
            <ul className="social">
              <a href="/login" className="button btn project-btn">
                <i className="fa fa-handshake-o"></i>Login
              </a>
              <a href="/register" className="button btn github-btn">
                <i className="fa fa-user-plus"></i>Register
              </a>
            </ul>
          </div>
        </div>

        <p className="scrolldown">
          <a href="#about">
            <i className="icon-down-circle"></i>
          </a>
        </p>
      </header>

      <section id="about">
        <div className="row">
          <div className="three columns">
            <img className="profile-pic" src="images/exam-system.jpg" alt="Exam Monitoring System" />
          </div>
          <div className="nine columns main-col">
            <h2>About the Exam Monitoring System</h2>
            <p>The Exam Monitoring System is designed to enhance the integrity and security of examinations by tracking student activities during exams. Using advanced surveillance technology and AI-driven analysis, the system detects and records anomalies or potential instances of misconduct. This not only ensures fair play but also helps in maintaining the credibility of the examination process.</p>
            <p>Features of the Exam Monitoring System include:</p>
            <ul>
              <li>Real-time monitoring and alerts</li>
              <li>Automated proctoring with AI</li>
              <li>Comprehensive reports and analytics</li>
              <li>Integration with existing examination platforms</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
