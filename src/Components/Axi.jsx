"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const baseUrl = "http://localhost:5173";

export default function Axi() {
  const [courseDetails, setCourseDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/course/details`);
        setCourseDetails(response.data.courseTitle);
        console.log(" data : "+response.data.courseTitle);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err);
      }
    };

    fetchCourseDetails();
  }, []);

  if (error) {
    return <div>Error fetching course details.</div>;
  }

  if (!courseDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Render your course details here */}
      <pre>{JSON.stringify(courseDetails, null, 2)}</pre>
    </div>
  );
}
