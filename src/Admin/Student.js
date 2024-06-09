import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import close from "../close.png";
import "./Student.css";

function Student() {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-students");
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  function deleteStudent(studentId) {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) {
      return;
    }

    const url = "http://127.0.0.1:5000/delete-student";
    const data = { studentId };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        fetchStudents();
      } else {
        alert("Error deleting student");
      }
    })
    .catch(error => {
      console.error("There was a problem with your fetch operation:", error);
    });
  }

  useEffect(() => {
    fetchStudents();
  }, []);


  return (
    <div className="student-card">
      <Link to='/'><button className="back-button">Back</button></Link>
      <h1>Students Details</h1>
      <ul>
        {students.map((student, index) => (
          <li key={index} className="student-item">
            <div className="top">
              <h3>ID: {student.studentId}</h3>
              <img
                onClick={() => deleteStudent(student.studentId)}
                src={close}
                alt="Delete"
                className="close-icon"
                aria-label="Delete student"
              />
            </div>
            <p>Name: {student.name}</p>
            <p>Email: {student.email}</p>
            <p>Attempt: {student.attempt}</p>
            <Link to={`/student-details/${student.studentId}/${student.name}/${student.email}`}>
              <button>show activity</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Student;
