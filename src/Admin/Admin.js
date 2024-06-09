import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Admin.css";
import close from "../close.png";

function Admin() {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const [selected, setSeleted] = useState({});

  const addQuestion = () => {
    const url = "http://127.0.0.1:5000/add-question";
    const data = {
      question: question,
      optionA: optionA,
      optionB: optionB,
      optionC: optionC,
      optionD: optionD,
      correctOption: correctOption,
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
        if (data.success) {
          alert("Question Added");
          setOptionA("");
          setOptionB("");
          setOptionC("");
          setOptionD("");
          setQuestion("");
          fetchQuestions();
        } else {
          alert("Error adding question");
        }
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  };

  const deleteQuestion = (question_id) => {
    const url = "http://127.0.0.1:5000/delete-question";
    const data = { question_id };

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
        if (data.success) {
          alert("Question deleted");
          fetchQuestions();
        } else {
          alert("Error deleting question");
        }
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-questions");
      const data = await response.json();
      setQuestionsList(data.questions);
    } catch (error) {
      alert(error);
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <>
      <div className="nav-btn">
        <Link to="/" className="Link">
          <button>Back</button>
        </Link>
        <Link to="/student" className="Link">
          <button>View Students</button>{" "}
        </Link>
      </div>
      <div className="container">
        <div className="add-question">
          <textarea
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            type="textarea"
            placeholder="Question"
          />
          <input
            className="input"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            type="text"
            placeholder="Option A"
          />
          <input
            className="input"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            type="text"
            placeholder="Option B"
          />
          <input
            className="input"
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
            type="text"
            placeholder="Option C"
          />
          <input
            className="input"
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
            type="text"
            placeholder="Option D"
          />
          <select
            className="input"
            value={correctOption}
            onChange={(e) => setCorrectOption(e.target.value)}
          >
            <option value="">Select the correct answer</option>
            <option value={optionA}>{optionA}</option>
            <option value={optionB}>{optionB}</option>
            <option value={optionC}>{optionC}</option>
            <option value={optionD}>{optionD}</option>
          </select>
          <button className="add-btn" onClick={addQuestion}>
            Add Question
          </button>
        </div>
        <div className="question-list">
          <h3>Questions</h3>
          <ul>
            {questionsList && questionsList.length > 0 ? (
              questionsList.map((question, index) => (
                <li key={index} className="question-item">
                  <div className="question-info">
                    <h3>{question.question}</h3>
                    <img
                      onClick={() => deleteQuestion(question.id)}
                      src={close}
                      alt="Close"
                      className="close-icon"
                    />
                  </div>
                  <div className="options">
                    <p>A: {question.optionA}</p>
                    <p>B: {question.optionB}</p>
                    <p>C: {question.optionC}</p>
                    <p>D: {question.optionD}</p>
                  </div>
                </li>
              ))
            ) : (
              <li>No questions available</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Admin;
