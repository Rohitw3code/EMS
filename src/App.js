import logo from "./logo.svg";
import "./App.css";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import Home from "./Home";
import { UserProvider } from "./UserContext";
import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  Routes,
} from "react-router-dom";
import Dash from "./Exam/Dash";
import Admin from "./Admin/Admin";
import Student from "./Admin/Student";
import Dashome from "./Exam/Dashome";
import StudentDetail from "./Admin/StudentDetail";
import AdminLogin from "./Admin/AdminLogin";

function App() {
  return (
    <UserProvider> {/* Wrap everything in UserProvider */}
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dash />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/student" element={<Student />} />
          <Route path="/home" element={<Dashome/>}/>
          <Route path="/student-details/:studentId/:name/:email" element={<StudentDetail />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
