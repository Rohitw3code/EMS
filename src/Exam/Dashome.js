import React, { useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashome() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState("");

  const fetchImage = async () => {
    const url = "http://127.0.0.1:5000/get_image";
    const data = { questionId:user.questionId};
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          alert(imageSrc);
        } else {
          alert("Error deleting question");
        }
      })
      .catch(error => {
        console.error("There was a problem with your fetch operation:", error);
      });
  };

  useEffect(() => {
    fetchImage();
  }, []);


  return (
    <div className=" home--container min-h-screen w-full bg-white text-pink-600">
      <div className="home--box">
        <div className=" home--sidebar">
          <div className="home--image">
            {imageSrc && <img src={imageSrc} alt="Student" />}{" "}
          </div>
          <div className="home--info">
            <h2>{user.name}</h2>
            <h2>{user.email}</h2>
          </div>
        </div>
        <div className=" home--exam">
          <h1>
            Take your time for the prepration for the exam and get started
          </h1>
          <button onClick={navigate("/dashboard")}>Start Exam</button>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4 18H6V20H18V4H6V6H4V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V18ZM6 11H13V13H6V16L1 12L6 8V11Z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Dashome;
