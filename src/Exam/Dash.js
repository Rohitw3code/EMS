import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import "./Dash.css";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import ParticlesBg from "particles-bg";


function Dash() {
  const [timer, setTimer] = useState(400); // 5 minutes in seconds
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const webcamRef = React.useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [audioValue, setAudioValue] = useState(0);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const audiopeak = 40;
  let warningCount = 0;
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Request permissions and create MediaRecorder instance
    async function prepareRecorder() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setRecorder(mediaRecorder);
    }
    prepareRecorder();
  }, []);

  const startRecording = () => {
    if (recorder && !isRecording) {
      recorder.start();
      setIsRecording(true);
      recorder.ondataavailable = async (event) => {
        const data = event.data;
        // Send data to server
        const formData = new FormData();
        formData.append("file", data, "audio.webm");
        formData.append("studentId", user.studentId);
        const response = await fetch("http://127.0.0.1:5000/upload-audio", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.error("Failed to upload audio");
        }
      };
    }
  };

  const stopRecording = () => {
    if (recorder && isRecording) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  function wisperDetected() {
    const url = "http://127.0.0.1:5000/wisper-detected";
    const data = {
      wisper: true,
      snapshot: snapshot,
      email: user.email,
      name: user.name,
      studentId: user.studentId,
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
          setSnapshot(null);
        }
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  }

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const dataArrayRef = useRef(null);

  const startAudioMonitor = () => {
    if (!navigator.mediaDevices.getUserMedia) {
      alert("Audio monitoring is not supported by your browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        mediaStreamRef.current = stream;
        dataArrayRef.current = dataArray;

        monitorAudio();
      })
      .catch((err) => {
        alert("Error accessing the microphone: " + err.message);
      });
  };

  function takeSnapshot() {
    try{
      const imageSrc = webcamRef.current.getScreenshot();
      setSnapshot(imageSrc); // Update snapshot state  
    }catch(error){

    }
  }

  useEffect(() => {
    if (snapshot) {
      wisperDetected();
    }
  }, [snapshot]);

  const monitorAudio = () => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      let average = sum / dataArray.length;

      setAudioValue(average);
      
      if (average > audiopeak) {
        if(warningCount > 60){
          // stopAudioMonitor();
          stopRecording();
          // alert("You have been removed from the examintion after warnings")
          navigate("/login");
        }warningCount+=1;
        // alert("wisper detected :"+average)
        // Threshold for whisper, tune this as needed
        // alert('Whisper detected! : ',average);
        setError(true);  // Set the error state to true
      
        setTimeout(() => {
          setError(false);  // Set the error state back to false after 1 second
        }, 1000);  // 1000 milliseconds = 1 second
        takeSnapshot();
      }

      requestAnimationFrame(monitorAudio);
    }
  };

  const stopAudioMonitor = () => {
    mediaStreamRef.current &&
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    audioContextRef.current && audioContextRef.current.close();
  };

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    const questionId = questions[currentQuestionIndex].id;
    const correctanswer = questions[currentQuestionIndex].correctAnswer;

    setSelected((prev) => ({
      ...prev,
      [questionId]: {
        select: value,
        correct: correctanswer,
      },
    }));
  };

  function submit() {
    const url = "http://127.0.0.1:5000/submit";
    const data = { selected: selected, studentId: user.studentId };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          navigate("/");
        } else {
          alert("Error deleting student");
        }
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  }

  function fetchQuestions() {
    const url = "http://127.0.0.1:5000/get-questions";
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setQuestions(data.questions);
      })
      .catch((error) => {
        alert(error);
      });
  }

  useEffect(() => {
    fetchQuestions();
    startAudioMonitor();
    startRecording();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          stopRecording();
          clearInterval(interval);
          navigate("/login");
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null); // Reset selected option
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setSelectedOption(null); // Reset selected option
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      {error && <div className="error-message">Do not talk in the exam time</div>}
      <div class="dashboard">
        <div class="exam">
          <div className="name-display">
            {user.name.toUpperCase()}
          </div>
          <div className="timer">{formatTime(timer)}  </div>

          {currentQuestion && (
            <div class="question">
              <h2>{currentQuestion.question}</h2>
              <ul>
                {["A", "B", "C", "D"].map((option) => (
                  <li key={option}>
                    <label>
                      <input
                        type="radio"
                        value={currentQuestion[`option${option}`]}
                        checked={
                          selectedOption === currentQuestion[`option${option}`]
                        }
                        onChange={handleOptionChange}
                        name={`option-${currentQuestionIndex}`}
                      />
                      {currentQuestion[`option${option}`]}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div class="action-btn">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
            </button>
            <Link className="Link">
              <button onClick={submit}>Submit</button>
            </Link>
          </div>
        </div>

        <div className="sec-camera">
          <Webcam className="camera" ref={webcamRef} height={300} width={300} />
          <div className="recording">
          <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
          <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dash;
