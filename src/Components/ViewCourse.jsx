// All "black" color classes changed to "gray-800"

import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  VideoCameraIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

function ViewCourse() {
  const { user } = useAuth();
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState( state?.course );

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
  course_id: '',
  courseTitle: '',
  courseDescription: '',
  instructorName: '',
  dept: '',
  duration: '0',
  credit: '0',
  isActive: true
  });

  const [newSection, setNewSection] = useState({
    sectionTitle: "",
    sectionDesc: "",
  });

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionEditData, setSectionEditData] = useState({
    sectionTitle: "",
    sectionDesc: "",
  });

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showSection, setShowSection] = useState(true);
  const [showAssignments, setShowAssignments] = useState(false);
  const [loading, setLoading] = useState(!state?.course);
  const [error, setError] = useState(null);

  // const fetchCourseDetails = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(`http://localhost:8080/api/course/details?id=${course_id}`);
  //       setCourse(response.data);
  //       console.log("resoponse.data ",response.data)
      
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //  useEffect(() => {
  //   if (course_id && !course) {
  //     fetchCourseDetails();
  //   }
  // }, [course.course_id]);

const handleEditCourse = () => {
  setEditData({
    course_id: course.course_id,
    courseTitle: course.courseTitle || '',
    courseDescription: course.courseDescription || '',
    instructorName: course.instructorName || '',
    dept: course.dept || availableDepartments[0],
    duration: course.duration?.toString() || '0',
    credit: course.credit?.toString() || '0',
    isActive: course.isActive !== undefined ? course.isActive : true
  });
  setIsEditing(true);
};


  const isEnrolled =
    user.role === "teacher" || user.role === "admin"
      ? true
      : localStorage.getItem(`enrolled_${id}`) === "true";

  
const handleSaveCourse = async (e) => {
  e.preventDefault();
  
  try {
    // Prepare the data for API request
    const updatedCourse = {
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
      updatedAt: new Date().toISOString(), // Better to use ISO format
    });
    
    setIsEditing(false);
    
    // Optional: Show success message
    console.log("Course updated successfully:", response.data);
    
  } catch (error) {
    console.error("Error updating course:", error);
    alert("Failed to update course. Please try again.");
  }
};

  const handleAddSection = () => {
    const currentSections = course.sections || [];
    const newSectionId =
      currentSections.length > 0
        ? Math.max(...currentSections.map((s) => s.id), 0) + 1
        : 1;

    setCourse({
      ...course,
      sections: [
        ...currentSections,
        {
          section_id: newSection.sectionId,
          sectionTitle: newSection.sectionTitle,
          sectionDesc: newSection.sectionDesc,
          createdAt : newSection.createdAt,
          updatedAt : newSection.updatedAt,
          videos: [],
          pdfs: [],
          assignments: [],
        },
      ],
    });
    setNewSection({ sectionTitle: "", content: "" });
    setShowAddSection(false);
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.id);
    setSectionEditData({
      sectionTitle: section.sectionTitle,
      sectionDesc: section.sectionDesc,
    });
  };

  const handleSaveSection = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCourse({
      ...course,
      sections: course.sections.map((section) =>
        section.id === editingSectionId
          ? {
              ...section,
              sectionTitle: sectionEditData.sectionTitle,
              sectionDesc: sectionEditData.sectionDesc,
            }
          : section
      ),      
    });
    setEditingSectionId(null);
  };

  const handleRemoveSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setCourse({
        ...course,
        sections: course.sections.filter((s) => s.id !== sectionId),
      });
    }
  };

  const handleAddVideo = (sectionId) => {
    setCurrentSectionId(sectionId);
    setShowVideoForm(true);
  };

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    const videoUrl = e.target.videoUrl.value;
    const videoTitle = e.target.videoTitle.value || "Untitled Video";

    setCourse({
      ...course,
      sections: course.sections.map((section) =>
        section.id === currentSectionId
          ? {
              ...section,
              videos: [...section.videos, { url: videoUrl, title: videoTitle }],
            }
          : section
      ),
    });
    setShowVideoForm(false);
  };

  const handleRemoveVideo = (sectionId, videoIndex) => {
    setCourse({
      ...course,
      sections: course.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              videos: section.videos.filter((_, index) => index !== videoIndex),
            }
          : section
      ),
    });
  };

  const handleAddPdf = (sectionId) => {
    setCurrentSectionId(sectionId);
    setShowPdfForm(true);
  };

  const handlePdfSubmit = (e) => {
    e.preventDefault();
    if (pdfFile) {
      const pdfUrl = URL.createObjectURL(pdfFile);
      const pdfTitle = e.target.pdfTitle.value || "Untitled Document";

      setCourse({
        ...course,
        sections: course.sections.map((section) =>
          section.id === currentSectionId
            ? {
                ...section,
                pdfs: [...section.pdfs, { url: pdfUrl, title: pdfTitle }],
              }
            : section
        ),
      });
      setShowPdfForm(false);
      setPdfFile(null);
    }
  };

  const handleRemovePdf = (sectionId, pdfIndex) => {
    setCourse({
      ...course,
      sections: course.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              pdfs: section.pdfs.filter((_, index) => index !== pdfIndex),
            }
          : section
      ),
    });
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  if (!course) return <div className="text-center py-10">Loading course...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Edit Course Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Course</h2>
            <form onSubmit={handleSaveCourse}>
              <div className="mb-5">
                <label className="block text-gray-800 mb-2 font-medium">Title</label>
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
                <label className="block text-gray-800 mb-2 font-medium">Description</label>
                <textarea
                  value={editData.courseDescription}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      courseDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-gray-800 mb-2 font-medium">Duration</label>
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
                  <label className="block text-gray-800 mb-2 font-medium">Credits</label>
                  <input
                    type="number"
                    value={editData.credit}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        credit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 mb-2 font-medium">Status</label>
                  <select
                    value={editData.isActive}
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
            <div className="md:w-1/3 relative">
              <img
                src={course.image}
                alt={course.courseTitle}
                className="w-full rounded-xl shadow-md border border-gray-200"
              />
              {/* {(user.role === "teacher" || user.role === "admin") && (
                <button
                  onClick={handleEditCourse}
                  className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 z-10 shadow"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              )} */}
            </div>
            <div className="md:w-2/3">
              <h1 className="text-4xl font-extrabold mb-3 text-gray-800">{course.courseTitle}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-900 rounded-full text-xs font-semibold">
                  {course.dept}
                </span>
                <span className="text-gray-600 text-sm">By <span className="text-red-600">{course.instructorName}</span></span>
                <span className="text-gray-600 text-sm">Duration: {course.duration}</span>
                <span className="text-gray-600 text-sm">Credits: {course.credit}</span>
                <span className="text-gray-600 text-sm">
                  Status: {course.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-gray-600 text-sm">Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                {course.updatedAt && (
                  <span className="text-gray-600 text-sm">Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
              <p className="text-base text-gray-800 mb-6">{course.courseDescription}</p>
              {!isEnrolled && user.role === "student" ? (
                <button
                  onClick={() => localStorage.setItem(`enrolled_${id}`, "true")}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900 transition font-bold"
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

          {/* Toggle between Sections and Assignments */}
          <div className="flex mb-4 border-b border-gray-200">
            <button
              onClick={() => {
                setShowSection(true);
                setShowAssignments(false);
              }}
              className={`px-4 py-2 font-medium ${showSection ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-500"}`}
            >
              Sections
            </button>
            <button
              onClick={() => {
                setShowSection(false);
                setShowAssignments(true);
              }}
              className={`px-4 py-2 font-medium ${showAssignments ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-500"}`}
            >
              Assignments
            </button>
          </div>

          {showSection && (
            <>
              {(isEnrolled || user.role === "teacher" || user.role === "admin") && (
                <div className="mt-4">
                  {(user.role === "teacher" || user.role === "admin") && (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowAddSection((prev) => !prev)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold"
                      >
                        {showAddSection ? "Hide Add Section" : "Add New Section"}
                      </button>
                      {showAddSection && (
                        <div className="mt-4 p-6 bg-gray-100 rounded-xl shadow">
                          <h3 className="font-semibold mb-2 text-gray-800">Add New Section</h3>
                          <div className="grid gap-4">
                            <input
                              type="text"
                              placeholder="Section Title"
                              value={newSection.sectionTitle}
                              onChange={(e) =>
                                setNewSection({ ...newSection, sectionTitle: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                            <textarea
                              placeholder="Section Content"
                              value={newSection.sectionDesc}
                              onChange={(e) =>
                                setNewSection({ ...newSection, sectionDesc: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                              rows="3"
                            />
                            <button
                              onClick={handleAddSection}
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold"
                              disabled={!newSection.sectionTitle}
                            >
                              Add Section
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(!showAddSection || user.role === "student") && (
                    <div className="space-y-6">
                      {course.sections && course.sections.length > 0 ? (
                        course.sections.map((section) => (
                          <div
                            key={section.id}
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
                                        courseTitle: e.target.value,
                                      })
                                    }
                                    className="px-3 py-1 border border-gray-200 rounded-lg"
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSaveSection(e)
                                    }
                                  />
                                ) : (
                                  <h3 className="font-semibold text-lg text-gray-800">{section.sectionTitle}</h3>
                                )}
                                {(user.role === "teacher" || user.role === "admin") && (
                                  <div className="flex gap-1">
                                    {editingSectionId === section.id ? (
                                      <>
                                        <button
                                          onClick={handleSaveSection}
                                          className="text-gray-900 hover:text-gray-800 font-semibold"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingSectionId(null)}
                                          className="text-gray-500 hover:text-gray-800 font-semibold"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleEditSection(section)}
                                          className="text-gray-900 hover:text-gray-800"
                                        >
                                          <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => handleRemoveSection(section.id)}
                                          className="text-gray-500 hover:text-gray-800"
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="p-6">
                              {editingSectionId === section.id ? (
                                <textarea
                                  value={sectionEditData.content}
                                  onChange={(e) =>
                                    setSectionEditData({
                                      ...sectionEditData,
                                      content: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
                                  rows="4"
                                />
                              ) : (
                                <p className="mb-4 text-gray-800">{section.content}</p>
                              )}

                              <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                                    <VideoCameraIcon className="w-5 h-5 text-gray-800" />
                                    Video Lectures
                                  </h4>
                                  {(user.role === "teacher" || user.role === "admin") && (
                                    <button
                                      onClick={() => handleAddVideo(section.id)}
                                      className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
                                    >
                                      <PlusIcon className="w-4 h-4" />
                                      Add Video
                                    </button>
                                  )}
                                </div>
                                {section.videos && section.videos.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.videos.map((video, index) => (
                                      <div
                                        key={index}
                                        className="bg-gray-100 p-4 rounded-lg relative shadow"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <h5 className="font-medium text-gray-800">{video.title}</h5>
                                          {(user.role === "teacher" ||
                                            user.role === "admin") && (
                                            <button
                                              onClick={() =>
                                                handleRemoveVideo(section.id, index)
                                              }
                                              className="text-gray-500 hover:text-gray-800"
                                            >
                                              <TrashIcon className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                        <div className="aspect-w-16 aspect-h-9">
                                          <iframe
                                            src={video.url}
                                            className="w-full h-48 rounded-lg border border-gray-200"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          ></iframe>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-400">No videos added yet</p>
                                )}
                              </div>

                              <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                                    <DocumentIcon className="w-5 h-5 text-gray-800" />
                                    Study Materials
                                  </h4>
                                  {(user.role === "teacher" || user.role === "admin") && (
                                    <button
                                      onClick={() => handleAddPdf(section.id)}
                                      className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
                                    >
                                      <PlusIcon className="w-4 h-4" />
                                      Add PDF
                                    </button>
                                  )}
                                </div>
                                {section.pdfs && section.pdfs.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.pdfs.map((pdf, index) => (
                                      <div
                                        key={index}
                                        className="bg-gray-100 p-4 rounded-lg shadow"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <h5 className="font-medium text-gray-800">{pdf.title}</h5>
                                          {(user.role === "teacher" ||
                                            user.role === "admin") && (
                                            <button
                                              onClick={() =>
                                                handleRemovePdf(section.id, index)
                                              }
                                              className="text-gray-500 hover:text-gray-800"
                                            >
                                              <TrashIcon className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                        <a
                                          href={pdf.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-block px-3 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-medium"
                                        >
                                          View PDF
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-400">
                                    No study materials added yet
                                  </p>
                                )}
                              </div>
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

                  {showVideoForm && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Video Lecture</h2>
                        <form onSubmit={handleVideoSubmit}>
                          <div className="mb-5">
                            <label className="block text-gray-800 mb-2 font-medium">
                              Video Title
                            </label>
                            <input
                              type="text"
                              name="videoTitle"
                              placeholder="Video title"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div className="mb-5">
                            <label className="block text-gray-800 mb-2 font-medium">
                              Video URL (YouTube, Vimeo, etc.)
                            </label>
                            <input
                              type="url"
                              name="videoUrl"
                              placeholder="https://youtube.com/embed/..."
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                              required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Use embed URL format (e.g.,
                              https://youtube.com/embed/videoID)
                            </p>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setShowVideoForm(false)}
                              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
                            >
                              Add Video
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {showPdfForm && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Study Materials</h2>
                        <form onSubmit={handlePdfSubmit}>
                          <div className="mb-5">
                            <label className="block text-gray-800 mb-2 font-medium">
                              Document Title
                            </label>
                            <input
                              type="text"
                              name="pdfTitle"
                              placeholder="Document title"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                          <div className="mb-5">
                            <label className="block text-gray-800 mb-2 font-medium">
                              Upload PDF File
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handlePdfFileChange}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowPdfForm(false);
                                setPdfFile(null);
                              }}
                              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!pdfFile}
                              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium disabled:opacity-50"
                            >
                              Upload PDF
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {showAssignments && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Assignments</h2>
              {false ? (
                <div className="space-y-4">
                  {/* Sample assignment - replace with dynamic data */}
                  <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">Assignment 1</h3>
                      <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                        Due: May 30
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      Complete the exercises in Chapter 3 and submit your solutions.
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Submitted: No
                      </span>
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
                        Submit Assignment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No assignments available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side (Progress) */}
        <div className="w-full lg:w-[30%]">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Course Progress</h2>
              {(() => {
                const totalSections = course.sections?.length || 0;
                const completedSections = Math.floor(totalSections / 2);
                const percent =
                  totalSections === 0
                    ? 0
                    : Math.round((completedSections / totalSections) * 100);

                return (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-800 font-medium">
                          {completedSections} of {totalSections} sections completed
                        </span>
                        <span className="text-sm text-gray-800 font-bold">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-gray-800 to-gray-800 h-3 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {course.sections && course.sections.length > 0 ? (
                        course.sections.map((section, idx) => (
                          <li
                            key={section.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              idx < completedSections
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gray-50 text-gray-800"
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full inline-block ${
                                idx < completedSections
                                  ? "bg-gray-800"
                                  : "bg-gray-300"
                              }`}
                            ></span>
                            <span className="truncate">{section.sectionTitle}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 text-sm">No sections yet</li>
                      )}
                    </ul>
                  </>
                );
              })()}
            </div>

            {/* Quick Actions */}
            {(user.role === "teacher" || user.role === "admin") && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddSection(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add New Section
                  </button>
                  <button
                    onClick={handleEditCourse}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Course Details
                  </button>
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
