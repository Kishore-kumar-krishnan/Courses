import React from "react";
import { BrowserRouter as Router, Routes , Route } from "react-router-dom";

import CourseList from './Components/CourseList';
import ErrorPage from "./Components/ErrorPage";
import CourseView from "./Components/CourseView";

function App() {
  return (
    <>
     <Router>
      <Routes>
        <Route path="/" element={<CourseList />} />
        {/* <Route path="/view-course/:id" element={<CourseList />} /> */}
        <Route path="/course/:id" element={<CourseView/>}/>
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
     </Router>
    </>
  )
}

export default App
