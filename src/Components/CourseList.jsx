import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CourseForm from "./CourseForm";

const categories = ["All", "Math", "Science", "Programming", "Art"];

const CourseList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('https://6835376fcd78db2058c098e8.mockapi.io/api/course');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const coursesData = await response.json();

        const coursesWithSections = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const sectionsResponse = await fetch(
                `https://6835376fcd78db2058c098e8.mockapi.io/api/course/${course.id}/sections`
              );
              const sections = sectionsResponse.ok ? await sectionsResponse.json() : [];
              return { ...course, sections };
            } catch (err) {
              console.error(`Error fetching sections for course ${course.id}:`, err);
              return { ...course, sections: [] };
            }
          })
        );

        setCourses(coursesWithSections);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  const searchFilteredCourses = filteredCourses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const suggestions = search
    ? filteredCourses
        .filter((course) =>
          course.title.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleShowMore = () => setVisibleCount((prev) => prev + 8);

  const handleViewCourse = (course) => {
    navigate(`/course/${course.id}`, {
      state: { course }
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") setShowSuggestions(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-white text-black">
      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-8 relative">
        <input
          type="text"
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow bg-white text-black"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleSearchKeyDown}
        />
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10 text-black">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="px-5 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => {
                  setSearch(s.title);
                  setShowSuggestions(false);
                }}
              >
                {s.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Course Button (for teachers/admins) */}
      {(user.role === "teacher" || user.role === "admin") && (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowCourseForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Add New Course
          </button>
        </div>
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <CourseForm
          onClose={() => setShowCourseForm(false)}
          onSave={(newCourseData) => {
            // In a real app, you would make an API call here
            const newCourse = {
              ...newCourseData,
              id: Math.max(...courses.map((c) => c.id)) + 1,
              author: user.name || "Current User",
              createdAt: new Date().toLocaleDateString(),
              updatedAt: new Date().toLocaleDateString(),
              longDescription: newCourseData.description,
              sections: [],
            };
            setCourses([newCourse, ...courses]);
            setShowCourseForm(false);
          }}
        />
      )}

      {/* Filter Buttons */}
      <div className="mb-6 text-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setVisibleCount(8);
              setSearch("");
            }}
            className={`mr-2 mb-2 px-6 py-2 rounded-full font-semibold transition-all shadow
              ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-black to-gray-700 text-white shadow-md"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-100"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid gap-8 max-w-6xl mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {searchFilteredCourses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-lg py-16">
            No courses found
          </div>
        ) : (
          searchFilteredCourses.slice(0, visibleCount).map((course) => (
            <div
              key={course.id}
              className="rounded-xl overflow-hidden bg-white bg-opacity-95 shadow-lg flex flex-col border border-gray-100 transition-transform duration-200 cursor-pointer hover:-translate-y-1.5 hover:scale-105 hover:shadow-2xl relative"
              onMouseEnter={() => setHoveredCourseId(course.id)}
              onMouseLeave={() => setHoveredCourseId(null)}
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={course.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={`Cover image for ${course.title}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                  }}
                />
                <span className="absolute top-3 left-3 bg-black bg-opacity-85 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                  {course.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="mb-2 text-lg font-bold text-black">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 flex-1">
                  {course.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>By {course.author}</span>
                  <span>{course.createdAt}</span>
                </div>
              </div>
              {/* Expanded Description on Hover */}
              {hoveredCourseId === course.id && (
                <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col justify-center items-center p-6 z-20 transition-all duration-300 text-black">
                  <h3 className="text-lg font-bold mb-2 text-black">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {course.longDescription}
                  </p>
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-black to-gray-700 text-white rounded-full font-semibold shadow hover:from-gray-900 hover:to-gray-700 transition"
                    onClick={() => handleViewCourse(course)}
                  >
                    View Course
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Show More Button */}
      {visibleCount < searchFilteredCourses.length && (
        <div className="text-center mt-10">
          <button
            onClick={handleShowMore}
            className="px-9 py-3 bg-gradient-to-r from-black to-gray-700 text-white rounded-full font-semibold text-lg shadow-lg hover:from-gray-900 hover:to-gray-700 transition"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;