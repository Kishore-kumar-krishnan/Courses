// All "black" color classes changed to "gray-800"
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import SectionContent from "./SectionContent";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import DisplayAssignments from "./DisplayAssignments";
import StudentProgressReport from "./StudentProgressReport";
import StudentProgressDisplay from "./StudentProgressDisplay";

function ViewCourse() {
  type UserRole = "student" | "teacher" | "admin";
  type User = {
    role: UserRole;
    [key: string]: any;
  };
  const { user } = useAuth() as { user: User };
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(state?.course);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    course_id: "",
    courseTitle: "",
    courseDescription: "",
    instructorName: "",
    dept: "",
    duration: "0",
    credit: "0",
    isActive: true,
  });

  const [newSection, setNewSection] = useState({
    sectionTitle: "",
    sectionDesc: "",
  });

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionEditData, setSectionEditData] = useState({
    section_id: 0,
    sectionTitle: "",
    sectionDesc: "",
    createdAt: null,
    updatedAt: null,
    course: { course_id: null },
  });

  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showSection, setShowSection] = useState(true);
  const [showAssignments, setShowAssignments] = useState(false);
  type Section = {
    section_id: number;
    sectionTitle: string;
    sectionDesc: string;
    createdAt: string | null;
    updatedAt: string | null;
    course?: { course_id: number | null };
  };

  const [courseSection, setCourseSection] = useState<Section[]>([]);
  const [loading, setLoading] = useState(!state?.course);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState(null);
  const isInitialRender = useRef(false);

  // Initial fetch for course details
  useEffect(() => {
    const fetchSection = async () => {
      try {
        const sectionResponse = await axios.get(
          `http://localhost:8080/api/course/section/details?id=${course.course_id}`
        );

        const sections = Array.isArray(sectionResponse.data)
          ? sectionResponse.data
          : [sectionResponse.data];

        setCourseSection(sections); // Update state
      } catch (error) {
        console.error("Error fetching section:", error);
      }
    };
    fetchSection();
    // eslint-disable-next-line
  }, [courseSection]);

  // course editing
  const handleEditCourse = async () => {
    setEditData({
      course_id: course.course_id,
      courseTitle: course.courseTitle || "",
      courseDescription: course.courseDescription || "",
      instructorName: course.instructorName || "",
      dept: course.dept || "",
      duration: course.duration?.toString() || "0",
      credit: course.credit?.toString() || "0",
      isActive: course.isActive !== undefined ? course.isActive : true,
    });
    setIsEditing(true);
  };
  // Ensure user.role is typed as string or a union of all possible roles
  const isEnrolled =
    user.role === "teacher" || user.role === "admin"
      ? true
      : localStorage.getItem(`enrolled_${id}`) === "true";
  // save updated course data
  interface EditData {
    course_id: string;
    courseTitle: string;
    courseDescription: string;
    instructorName: string;
    dept: string;
    duration: number;
    credit: number;
    isActive: boolean;
  }

  interface Course {
    course_id: string;
    courseTitle: string;
    courseDescription: string;
    instructorName: string;
    dept: string;
    duration: number;
    credit: number;
    isActive: boolean;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  const handleSaveCourse = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      // Prepare the data for API request
      const updatedCourse: EditData & { duration: number; credit: number } = {
        ...editData,
        duration: parseInt(editData.duration),
        credit: parseInt(editData.credit),
      };

      // Make PUT request to update the course
      const response = await axios.put(
        "http://localhost:8080/api/course/update",
        updatedCourse
      );

      // Update local state only after successful API response
      setCourse({
        ...course,
        ...updatedCourse,
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);

      // Optional: Show success message
      console.log("Course updated successfully:", response.data);
    } catch (error: any) {
      console.error("Error updating course:", error);
      alert("Failed to update course. Please try again.");
    }
  };
  // handle add new section
  const handleAddSection = async () => {
    try {
      // Prepare the request body
      const requestBody = {
        sectionTitle: newSection.sectionTitle,
        sectionDesc: newSection.sectionDesc,
        course: { course_id: course.course_id },
      };
      // Make API call to add section
      const response = await axios.post(
        "http://localhost:8080/api/course/section/add",
        requestBody
      );
      // If the API returns the newly created section
      const createdSection = response.data;
      // Update local state with the new section
      setCourseSection((prevSections) => [
        ...prevSections,
        {
          section_id: Number(createdSection.section_id),
          sectionTitle: createdSection.sectionTitle,
          sectionDesc: createdSection.sectionDesc,
          createdAt: createdSection.createdAt || new Date().toISOString(),
          updatedAt: createdSection.updatedAt || new Date().toISOString(),
        },
      ]);
      // Reset form
      setNewSection({ sectionTitle: "", sectionDesc: "" });
      setShowAddSection(false);
    } catch (error) {
      console.error("Error adding section:", error);
    }
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.section_id);
    setSectionEditData({
      section_id: section.section_id,
      sectionTitle: section.sectionTitle,
      sectionDesc: section.sectionDesc,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      course: { course_id: course.course_id },
    });
  };
  // handle save section - called by handleeditsection
  const handleSaveSection = async (e) => {
    e.preventDefault();

    try {
      // Get the current timestamp for updatedAt
      const now = new Date().toISOString();

      const payload = {
        section_id: sectionEditData.section_id,
        sectionTitle: sectionEditData.sectionTitle,
        sectionDesc: sectionEditData.sectionDesc,
        createdAt: sectionEditData.createdAt,
        updatedAt: now,
        course: { course_id: course.course_id },
      };

      const response = await axios.put(
        "http://localhost:8080/api/course/section/update",
        payload
      );

      setEditingSectionId(null);
      setSectionEditData({
        section_id: 0,
        sectionTitle: "",
        sectionDesc: "",
        createdAt: null,
        updatedAt: null,
        course: { course_id: null },
      });
      setError(null);
    } catch (err) {
      console.error("Failed to update section:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update section"
      );
    }
  };
  // handle delete / remove section (delete icon)
  const handleRemoveSection = async (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        const requestBody = String(sectionId);
        await axios.delete(`http://localhost:8080/api/course/section/delete`, {
          data: requestBody,
          headers: {
            "Content-Type": "text/plain",
          },
        });

        setCourseSection((prevSections) =>
          prevSections.filter((s) => s.section_id !== sectionId)
        );

        console.log("Section deleted successfully");
      } catch (error) {
        console.error("Error while deleting section:", error);

        if (axios.isAxiosError(error)) {
          alert(error.response?.data?.message || "Failed to delete section");
        } else {
          alert("An unexpected error occurred");
        }
      }
    }
  };

  if (!course)
    return <div className="text-center py-10">Loading course...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Edit Course Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Edit Course
            </h2>
            <form onSubmit={handleSaveCourse}>
              <div className="mb-5">
                <label className="block text-gray-800 mb-2 font-medium">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.courseTitle}
                  onChange={(e) =>
                    setEditData({ ...editData, courseTitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-gray-800 mb-2 font-medium">
                  Description
                </label>
                <textarea
                  value={editData.courseDescription}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      courseDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-gray-800 mb-2 font-medium">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editData.duration}
                    onChange={(e) =>
                      setEditData({ ...editData, duration: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="e.g., 8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 mb-2 font-medium">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={editData.credit}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        credit: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 mb-2 font-medium">
                    Status
                  </label>
                  <select
                    value={editData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side (Course Content) */}
        <div className="w-full lg:w-[70%]">
          {/* Course Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="md:w-1/2 relative aspect-video">
              {" "}
              {/* Adjust aspect ratio as needed */}
              <img
                src={course.imageUrl}
                alt={course.courseTitle}
                className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200"
              />
            </div>
            {/* Left side course details */}
            <div className="md:w-2/3">
              <h1 className="text-4xl font-extrabold mb-3 text-gray-800">
                {course.courseTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-900 rounded-full text-xs font-semibold">
                  {course.dept}
                </span>
                <span className="text-gray-600 text-sm">
                  By{" "}
                  <span className="text-red-600">{course.instructorName}</span>
                </span>
                <span className="text-gray-600 text-sm">
                  Duration: {course.duration}
                </span>
                <span className="text-gray-600 text-sm">
                  Credits: {course.credit}
                </span>
                <span className="text-gray-600 text-sm">
                  Status: {course.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-gray-600 text-sm">
                  Created: {new Date(course.createdAt).toLocaleDateString()}
                </span>
                {course.updatedAt && (
                  <span className="text-gray-600 text-sm">
                    Updated: {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-base text-gray-800 mb-6">
                {course.courseDescription}
              </p>
              {!isEnrolled && user.role === "student" ? (
                <button
                  onClick={() => localStorage.setItem(`enrolled_${id}`, "true")}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900 transition font-bold cursor-pointer"
                >
                  Enroll Now
                </button>
              ) : (
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl inline-block font-semibold shadow">
                  {user.role === "teacher" || user.role === "admin"
                    ? "You have editing access"
                    : "You're enrolled in this course"}
                </div>
              )}
            </div>
          </div>

          {/* Toggle between Sections and Assignments and View report button */}
          <div className="flex mb-4 border-b border-gray-200">
            <button
              onClick={() => {
                setShowSection(true);
                setShowAssignments(false);
                setShowReport(false);
              }}
              className={`px-4 py-2 font-medium ${
                showSection
                  ? "text-gray-800 border-b-2 border-gray-800"
                  : "text-gray-500"
              }`}
            >
              Sections
            </button>
            <button
              onClick={() => {
                setShowSection(false);
                setShowAssignments(true);
                setShowReport(false);
              }}
              className={`px-4 py-2 font-medium ${
                showAssignments
                  ? "text-gray-800 border-b-2 border-gray-800"
                  : "text-gray-500"
              }`}
            >
              Assignments
            </button>
            {user.role === "teacher" && (
              <button
                onClick={() => {
                  setShowSection(false);
                  setShowAssignments(false);
                  setShowReport(true);
                }}
                className={`px-4 py-2 font-medium ${
                  showReport
                    ? "text-gray-800 border-b-2 border-gray-800"
                    : "text-gray-500"
                }`}
              >
                View Report
              </button>
            )}
          </div>

          {/* handle add section */}
          {showSection && (
            <>
              {(isEnrolled ||
                user.role === "teacher" ||
                user.role === "admin") && (
                <div className="mt-4">
                  {(user.role === "teacher" || user.role === "admin") && (
                    <div className="mb-4">
                      {showAddSection && (
                        <div className="mt-4 p-6 bg-gray-100 rounded-xl shadow">
                          <h3 className="font-semibold mb-2 text-gray-800">
                            Add New Section
                          </h3>
                          <div className="grid gap-4">
                            <input
                              type="text"
                              placeholder="Section Title"
                              value={newSection.sectionTitle}
                              onChange={(e) =>
                                setNewSection({
                                  ...newSection,
                                  sectionTitle: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                            <textarea
                              placeholder="Section Content"
                              value={newSection.sectionDesc}
                              onChange={(e) =>
                                setNewSection({
                                  ...newSection,
                                  sectionDesc: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                              rows={3}
                            />
                            <button
                              onClick={handleAddSection}
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold cursor-pointer"
                              disabled={!newSection.sectionTitle}
                            >
                              Add Section
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* section view */}
                  {(!showAddSection || user.role === "student") && (
                    <div className="space-y-6">
                      {courseSection.length > 0 ? (
                        courseSection.map((section) => (
                          <div
                            key={section.section_id}
                            className="border border-gray-200 rounded-xl shadow bg-white overflow-hidden"
                          >
                            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {editingSectionId === section.section_id ? (
                                  <input
                                    type="text"
                                    value={sectionEditData.sectionTitle}
                                    onChange={(e) =>
                                      setSectionEditData({
                                        ...sectionEditData,
                                        sectionTitle: e.target.value,
                                      })
                                    }
                                    className="px-3 py-1 border border-gray-200 rounded-lg"
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSaveSection(e)
                                    }
                                  />
                                ) : (
                                  <h3 className="font-semibold text-lg text-gray-800">
                                    {section.sectionTitle}
                                  </h3>
                                )}
                                {(user.role === "teacher" ||
                                  user.role === "admin") && (
                                  <div className="flex gap-1">
                                    {editingSectionId === section.section_id ? (
                                      <>
                                        <button
                                          onClick={handleSaveSection}
                                          className="text-gray-900 hover:text-gray-800 font-semibold"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() =>
                                            setEditingSectionId(null)
                                          }
                                          className="text-gray-500 hover:text-gray-800 font-semibold"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleEditSection(section)
                                          }
                                          className="text-gray-900 hover:text-gray-800"
                                        >
                                          <PencilSquareIcon className="w-5 h-5 cursor-pointer" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleRemoveSection(
                                              section.section_id
                                            )
                                          }
                                          className="text-gray-500 hover:text-gray-800"
                                        >
                                          <TrashIcon className="w-5 h-5 cursor-pointer " />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="p-6">
                              {editingSectionId === section.section_id ? (
                                <textarea
                                  value={sectionEditData.sectionDesc}
                                  onChange={(e) =>
                                    setSectionEditData({
                                      ...sectionEditData,
                                      sectionDesc: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
                                  rows={4}
                                />
                              ) : (
                                <pre className="font-sans font-medium">
                                  <p className="mb-4 text-gray-800">
                                    {section.sectionDesc}
                                  </p>
                                </pre>
                              )}
                              {/* for video and pdf */}
                              <SectionContent
                                key={section.section_id}
                                section={section}
                                user={user}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-lg">
                          No sections available yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {/* handle show assignments */}
          {showAssignments && (
            <>
              {(isEnrolled ||
                user.role === "teacher" ||
                user.role === "admin") && (
                <DisplayAssignments
                  courseId={course.course_id}
                  showAssignments={showAssignments}
                />
              )}
            </>
          )}
          {/* handle show entire report */}
          {showReport && (
            <div className="mt-4">
              <StudentProgressReport courseId={course.course_id} />
            </div>
          )}
        </div>

        {/* Right Side (Progress) */}
        <div className="w-full lg:w-[30%]">
          <div className="sticky top-24 space-y-4">
            {isEnrolled && user.role === "student" && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Course Progress
                </h2>
                <StudentProgressDisplay
                  courseId={course.course_id}
                  studentId={course.section_id}
                />
              </div>
            )}

            {/* Quick Actions / Handle add section and handle edit course details */}
            {(user.role === "teacher" || user.role === "admin") && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowAddSection((prev) => !prev);
                      setShowSection(true);
                      setShowAssignments(false);
                      setShowReport(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer"
                  >
                    <PlusIcon className="w-5 h-5" />
                    {showAddSection ? "Hide Add Section" : "Add New Section"}
                  </button>
                  <button
                    onClick={handleEditCourse}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Course Details
                  </button>
                  {/* create assignment button link to assignment team page */}
                  <Link to="/faculty/assignments/create">
                    <button className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer">
                      <PlusIcon className="w-5 h-5" />
                      Create New Assignment
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;
