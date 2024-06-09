import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import "./Login.css";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import ParticlesBg from "particles-bg";

function Login() {
  const [Id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("user already exists");
  const [snapshot, setSnapshot] = useState(null);
  const navigate = useNavigate();
  const webcamRef = React.useRef(null);
  const { user, updateUser } = useContext(UserContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(false);
      setErrorMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  function auth() {
    const url = "http://127.0.0.1:5000/login";
    const data = {
      Id: Id,
      email: email,
      snapshot: snapshot,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data["success"]) {
          updateUser({
            name: data["data"]["name"],
            email: email,
            studentId: Id,
          });
          navigate("/dashboard");
        } else {
          setError(true);
          setErrorMessage(data["error"]);
        }
      })
      .catch((error) => {
        alert(error);
        console.error("There was a problem with your fetch operation:", error);
      });
  }

  function takeSnapshot() {
    const imageSrc = webcamRef.current.getScreenshot();
    setSnapshot(imageSrc);
  }

  function resetSnapshot() {
    setSnapshot(null);
  }

  return (
    <div className="card">
      <ParticlesBg type="circle" bg={true} />
      {error && <div className="error-message">{errorMessage}</div>}
      <h2>Online Exam System</h2>
      <Link to="/" className="link">
        ← Back to List
      </Link>
      <div className="camera-container">
        {snapshot ? (
          <img className="snapshot" src={snapshot} alt="Snapshot" />
        ) : (
          <Webcam className="camera" width={350} height={350} ref={webcamRef} />
        )}
        <div className="camera-buttons">
          {!snapshot && (
            <button onClick={takeSnapshot} className="snapshot-btn">
              Take Snapshot
            </button>
          )}
          {snapshot && (
            <button onClick={resetSnapshot} className="reset-btn">
              Reset Snapshot
            </button>
          )}
        </div>
      </div>
      <div className="cred">
        <input
          className="input-field"
          value={Id}
          type="number"
          placeholder="ID"
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className="input-field"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={auth} className="auth-btn">
          Login
        </button>
        <Link to="/register" className="link">
          Create a new account
        </Link>
      </div>
    </div>
  );
}

export default Login;
