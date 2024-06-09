import "./Register.css";
import { useFaceDetection } from "react-use-face-detection";
import FaceDetection from "@mediapipe/face_detection";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import takePhoto from "../capture.png";
import ParticlesBg from "particles-bg";
import ProgressBar from "@ramonak/react-progress-bar";

function Register() {
  const [Id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("User already exists");
  const [photoData, setPhotoData] = useState([]);
  const [progress, setProgress] = useState(0); // Progress state to track button clicks
  const [totalSteps, setTotalSteps] = useState(2);
  const [captured, setCaptured] = useState(false);
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  useEffect(() => {
    // Hide error message after 3 seconds
    const timer = setTimeout(() => {
      setError(false);
      setErrorMessage("");
    }, 3000);

    return () => clearTimeout(timer); // Clear the timer when component unmounts or rerenders
  }, [error]); // Re-run effect when 'error' state changes

  // Function to capture photo and set photo data state
  const capturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setPhotoData((prevPhotos) => [...prevPhotos, photo]); // Add captured photo to array
    setProgress((prevProgress) => Math.min(prevProgress + 1, totalSteps)); // Increment progress
    setCaptured(true); // Set captured state to true
    // Reset captured state after 1 second to remove the effect
    setTimeout(() => {
      setCaptured(false);
    }, 500);
  };

  // Function to handle signup
  const signup = () => {
    const url = "http://127.0.0.1:5000/register";
    const data = {
      Id: Id,
      email: email,
      name: name,
      photos: photoData, // Pass array of photo data to the backend
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
          alert("Registration successful");
          navigate("/login");
        } else {
          setError(true);
          setErrorMessage(data["error"]);
        }
      })
      .catch((error) => {
        // Handle errors
        console.error("There was a problem with your fetch operation:", error);
      });
  };

  return (
    <>
      <div className="card">
        <ParticlesBg type="circle" bg={true} />
        {error && <div className="error-message">{errorMessage}</div>}
        <center>
          <h2>Online Exam System</h2>
          <Link to="/" className="link">
            ← Back to List
          </Link>
        </center>
        <div className="capture-train-image">
          <Webcam className="camera" height={300} width={380} ref={webcamRef} />
          <ProgressBar
            completed={(progress / totalSteps) * 100}
            width="350px"
            height="10px"
          />
          <button onClick={capturePhoto}>
            <i className="fa fa-camera"></i>
          </button>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${(progress / totalSteps) * 100}%` }}
            ></div>
          </div>
          {captured && <div className="captured-effect">Image Captured!</div>}
        </div>
        <div className="cred">
          <input
            className="ID"
            value={Id}
            type="number"
            onChange={(e) => setId(e.target.value)}
            placeholder="ID"
          />
          <input
            className="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <button className="register-btn" onClick={signup}>
            Register
          </button>
          <Link to="/login" className="link">
            Already have an account?
          </Link>
        </div>
      </div>
    </>
  );
}

export default Register;
