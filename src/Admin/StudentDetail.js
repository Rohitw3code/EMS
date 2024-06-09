import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./StudentDetail.css"; // Make sure your CSS path is correct

function StudentDetail() {
  const { studentId, name, email } = useParams();
  const [images, setImages] = useState([]);
  const [testScore, setTestScore] = useState([]);

  const fetchPhotos = () => {
    const url = `http://127.0.0.1:5000/get-photos?studentId=${studentId}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setImages(data.images);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const fetchTestScore = () => {
    const url = `http://127.0.0.1:5000/get-testscore?studentId=${studentId}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setTestScore(data.scores);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  useEffect(() => {
    fetchPhotos();
    fetchTestScore();
  }, [studentId]); // Add studentId as a dependency to re-fetch if it changes

  return (
    <div className="card">
      <Link to="/student" className="link">
        ← Back to List
      </Link>
      <h2 className="heading-color">Student Details</h2>
      <hr />
      <div className="content">
        <div className="left-column">
          <div className="student-info">
            <p className="detail">
              <strong>ID:</strong> {studentId}
            </p>
            <p className="detail">
              <strong>Name:</strong> {name}
            </p>
            <p className="detail">
              <strong>Email:</strong> {email}
            </p>
          </div>

          <div className="test-scores">
            <h2>Test Scores</h2>
            {testScore.length > 0 ? (
              testScore.map((val, index) => (
                <div key={index} className="test-score-item">
                  <p>Test ID: {val.testId}</p>
                  <p>Score: {val.score}</p>
                  <p>Submit Time: {val.submitTime}</p>
                </div>
              ))
            ) : (
              <p>No scores available</p>
            )}
          </div>
        </div>
        <div className="right-column">
          <h2>Wispered Captured Photos</h2>
          <div className="photo-gallery">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt="Student"
                className="student-photo"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
