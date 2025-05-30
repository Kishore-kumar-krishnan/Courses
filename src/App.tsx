
import React from "react";
import { Router, Routes , Route } from "react-router-dom";

import CourseList from './Components/CourseList';
import ErrorPage from "./Components/ErrorPage";
import ViewCourse from "./Components/ViewCourse";
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<CourseList />} />
        <Route path="/course/:id" element={<ViewCourse />} />

        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
    </AuthProvider>
  );
}

export default App;
