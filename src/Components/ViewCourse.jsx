import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const [course, setCourse] = useState(
    state?.course || {
      title: "",
      description: "",
      longDescription: "",
      duration: "",
      credit: 0,
      isActive: true,
      sections: [],
    }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    longDescription: "",
    duration: "",
    credit: 0,
    isActive: true,
  });

  const [newSection, setNewSection] = useState({
    title: "",
    content: "",
  });

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionEditData, setSectionEditData] = useState({
    title: "",
    content: "",
  });

  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    if (course) {
      setEditData({
        title: course.title,
        description: course.description,
        longDescription: course.longDescription,
        duration: course.duration,
        credit: course.credit,
        isActive: course.isActive,
      });
    }
  }, [course]);

  const isEnrolled =
    user.role === "teacher" || user.role === "admin"
      ? true
      : localStorage.getItem(`enrolled_${id}`) === "true";

  // Edit Course Details
  const handleEditCourse = () => setIsEditing(true);

  const handleSaveCourse = (e) => {
    e.preventDefault();
    setCourse({
      ...course,
      ...editData,
      updatedAt: new Date().toLocaleDateString(),
    });
    setIsEditing(false);
  };

  // Section Management
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
          id: newSectionId,
          title: newSection.title,
          content: newSection.content,
          videos: [],
          pdfs: [],
          assignments: [],
        },
      ],
    });
    setNewSection({ title: "", content: "" });
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.id);
    setSectionEditData({
      title: section.title,
      content: section.content,
    });
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    setCourse({
      ...course,
      sections: course.sections.map((section) =>
        section.id === editingSectionId
          ? {
              ...section,
              title: sectionEditData.title,
              content: sectionEditData.content,
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

  // Video Management
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

  // PDF Management
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

  // View Assignments
  const handleViewAssignments = () => {
    navigate(`/course/${id}/assignments`);
  };

  if (!course)
    return <div className="text-center py-10">Loading course...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Edit Course Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={handleSaveCourse}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editData.longDescription}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      longDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={editData.duration}
                    onChange={(e) =>
                      setEditData({ ...editData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., 8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Credits</label>
                  <input
                    type="number"
                    value={editData.credit}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        credit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={editData.isActive}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
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
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3 relative">
          <img
            src={course.image}
            alt={course.title}
            className="w-full rounded-lg shadow-lg"
          />
          {(user.role === "teacher" || user.role === "admin") && (
            <button
              onClick={handleEditCourse}
              className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 z-10"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">
              {course.category}
            </span>
            <span className="text-gray-600">By {course.author}</span>
            <span className="text-gray-600">Duration: {course.duration}</span>
            <span className="text-gray-600">Credits: {course.credit}</span>
            <span className="text-gray-600">
              Status: {course.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-gray-600">Created: {course.createdAt}</span>
            {course.updatedAt && (
              <span className="text-gray-600">Updated: {course.updatedAt}</span>
            )}
          </div>
          <p className="text-lg mb-6">{course.longDescription}</p>

          {/* Syllabus Download (only for enrolled students) */}
          {/* {isEnrolled && user.role === "student" && course.syllabusPdf && (
            <div className="mb-4">
              <a
                href={course.syllabusPdf}
                download
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Download Syllabus (PDF)
              </a>
            </div>
          )} */}

          {/* Assignments button moved outside sections */}
          {/* <div className="mb-4">
            <button
              onClick={handleViewAssignments}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              View All Assignments
            </button>
          </div> */}

          {!isEnrolled && user.role === "student" ? (
            <button
              onClick={() => localStorage.setItem(`enrolled_${id}`, "true")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Enroll Now
            </button>
          ) : (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
              {user.role === "teacher" || user.role === "admin"
                ? "You have editing access"
                : "You're enrolled in this course"}
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      {(isEnrolled || user.role === "teacher" || user.role === "admin") && (
        <div className="mt-8">
          {(user.role === "teacher" || user.role === "admin") && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Add New Section</h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  placeholder="Section Content"
                  value={newSection.content}
                  onChange={(e) =>
                    setNewSection({ ...newSection, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={!newSection.title}
                >
                  Add Section
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {course.sections && course.sections.length > 0 ? (
              course.sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {editingSectionId === section.id ? (
                        <input
                          type="text"
                          value={sectionEditData.title}
                          onChange={(e) =>
                            setSectionEditData({
                              ...sectionEditData,
                              title: e.target.value,
                            })
                          }
                          className="px-2 py-1 border rounded"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveSection(e)
                          }
                        />
                      ) : (
                        <h3 className="font-medium">{section.title}</h3>
                      )}
                      {(user.role === "teacher" || user.role === "admin") && (
                        <div className="flex gap-1">
                          {editingSectionId === section.id ? (
                            <>
                              <button
                                onClick={handleSaveSection}
                                className="text-green-500 hover:text-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSectionId(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditSection(section)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    {editingSectionId === section.id ? (
                      <textarea
                        value={sectionEditData.content}
                        onChange={(e) =>
                          setSectionEditData({
                            ...sectionEditData,
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded mb-4"
                        rows="4"
                      />
                    ) : (
                      <p className="mb-4">{section.content}</p>
                    )}

                    {/* Videos Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <VideoCameraIcon className="w-5 h-5 text-red-500" />
                          Video Lectures
                        </h4>
                        {(user.role === "teacher" || user.role === "admin") && (
                          <button
                            onClick={() => handleAddVideo(section.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            <PlusIcon className="w-3 h-3" />
                            Add Video
                          </button>
                        )}
                      </div>
                      {section.videos && section.videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.videos.map((video, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-4 rounded-lg relative"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{video.title}</h5>
                                {(user.role === "teacher" ||
                                  user.role === "admin") && (
                                  <button
                                    onClick={() =>
                                      handleRemoveVideo(section.id, index)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                  src={video.url}
                                  className="w-full h-48 rounded"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No videos added yet</p>
                      )}
                    </div>

                    {/* PDFs Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <DocumentIcon className="w-5 h-5 text-blue-500" />
                          Study Materials
                        </h4>
                        {(user.role === "teacher" || user.role === "admin") && (
                          <button
                            onClick={() => handleAddPdf(section.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                          >
                            <PlusIcon className="w-3 h-3" />
                            Add PDF
                          </button>
                        )}
                      </div>
                      {section.pdfs && section.pdfs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.pdfs.map((pdf, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{pdf.title}</h5>
                                {(user.role === "teacher" ||
                                  user.role === "admin") && (
                                  <button
                                    onClick={() =>
                                      handleRemovePdf(section.id, index)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <a
                                href={pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                View PDF
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No study materials added yet
                        </p>
                      )}
                    </div>

                    {/* Assignments Section */}
                    {/* {section.assignments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <ClipboardDocumentListIcon className="w-5 h-5 text-green-500" />
                          Assignments ({section.assignments.length})
                        </h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <button
                            onClick={handleViewAssignments}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View all assignments for this section →
                          </button>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No sections available yet
              </div>
            )}
          </div>

          {/* Add Video Modal */}
          {showVideoForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Video Lecture</h2>
                <form onSubmit={handleVideoSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Video Title
                    </label>
                    <input
                      type="text"
                      name="videoTitle"
                      placeholder="Video title"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Video URL (YouTube, Vimeo, etc.)
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      placeholder="https://youtube.com/embed/..."
                      className="w-full px-3 py-2 border rounded"
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
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Add Video
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add PDF Modal */}
          {showPdfForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Study Materials</h2>
                <form onSubmit={handlePdfSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      name="pdfTitle"
                      placeholder="Document title"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Upload PDF File
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfFileChange}
                      className="w-full px-3 py-2 border rounded"
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
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!pdfFile}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
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
    </div>
  );
}

export default ViewCourse;
