import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

function ViewCourse() {
  const { user } = useAuth();
  const { id } = useParams();
  const { state } = useLocation();
  const [course, setCourse] = useState(state?.course || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    longDescription: ''
  });
  const [newSection, setNewSection] = useState({ title: '', content: '' });
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    pdfFile: null,
    submitted: false
  });

  // Initialize editData when course loads
  useEffect(() => {
    if (course) {
      setEditData({
        title: course.title,
        description: course.description,
        longDescription: course.longDescription
      });
    }
  }, [course]);

  const isEnrolled = user.role === 'teacher' || user.role === 'admin' 
    ? true 
    : localStorage.getItem(`enrolled_${id}`) === "true";

  // Edit Course Details
  const handleEditCourse = () => {
    setIsEditing(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    setCourse({
      ...course,
      ...editData,
      updatedAt: new Date().toLocaleDateString()
    });
    setIsEditing(false);
  };

  // Section Management
  const handleAddSection = () => {
    const newSectionId = Math.max(...course.sections.map(s => s.id || 0), 0) + 1;
    setCourse({
      ...course,
      sections: [
        ...course.sections,
        {
          id: newSectionId,
          title: newSection.title,
          content: newSection.content,
          duration: '1 hour',
          assignments: []
        }
      ]
    });
    setNewSection({ title: '', content: '' });
  };

  const handleRemoveSection = (sectionId) => {
    setCourse({
      ...course,
      sections: course.sections.filter(s => s.id !== sectionId)
    });
  };

  // Assignment Management
  const handleAddAssignmentClick = (sectionId) => {
    setCurrentSectionId(sectionId);
    setNewAssignment({
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 604800000).toISOString().split('T')[0],
      pdfFile: null,
      submitted: false
    });
    setShowAssignmentForm(true);
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    const assignmentToAdd = {
      ...newAssignment,
      id: Date.now(),
      submitted: false
    };

    setCourse({
      ...course,
      sections: course.sections.map(section => 
        section.id === currentSectionId
          ? {
              ...section,
              assignments: [...section.assignments, assignmentToAdd]
            }
          : section
      )
    });
    setShowAssignmentForm(false);
  };

  const handleSubmitAssignment = (sectionId, assignmentId) => {
    setCourse({
      ...course,
      sections: course.sections.map(section => 
        section.id === sectionId
          ? {
              ...section,
              assignments: section.assignments.map(assignment => 
                assignment.id === assignmentId
                  ? { ...assignment, submitted: true }
                  : assignment
              )
            }
          : section
      )
    });
  };

  if (!course) return <div className="text-center py-10">Loading course...</div>;

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
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                  required
                />
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
          {(user.role === 'teacher' || user.role === 'admin') && (
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
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">
              {course.category}
            </span>
            <span className="text-gray-600">By {course.author}</span>
            <span className="text-gray-600">Created: {course.createdAt}</span>
            {course.updatedAt && (
              <span className="text-gray-600">Updated: {course.updatedAt}</span>
            )}
          </div>
          <p className="text-lg mb-6">{course.longDescription}</p>
          
          {/* Syllabus Download (only for enrolled students) */}
          {isEnrolled && user.role === 'student' && course.syllabusPdf && (
            <div className="mb-4">
              <a 
                href={course.syllabusPdf} 
                download
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Download Syllabus (PDF)
              </a>
            </div>
          )}

          {!isEnrolled && user.role === 'student' ? (
            <button
              onClick={() => localStorage.setItem(`enrolled_${id}`, "true")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Enroll Now
            </button>
          ) : (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
              {user.role === 'teacher' || user.role === 'admin' 
                ? "You have editing access" 
                : "You're enrolled in this course"}
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      {(isEnrolled || user.role === 'teacher' || user.role === 'admin') && (
        <div className="mt-8">
          {(user.role === 'teacher' || user.role === 'admin') && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Add New Section</h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  placeholder="Section Content"
                  value={newSection.content}
                  onChange={(e) => setNewSection({...newSection, content: e.target.value})}
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
            {course.sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{section.title}</h3>
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <button
                        onClick={() => handleRemoveSection(section.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{section.duration}</span>
                </div>
                <div className="p-5">
                  <p className="mb-4">{section.content}</p>
                  
                  {/* Assignments Section */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Assignments</h4>
                      {user.role === 'teacher' || user.role === 'admin' ? (
                        <button
                          onClick={() => handleAddAssignmentClick(section.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Add Assignment
                        </button>
                      ) : section.assignments.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {section.assignments.length} assignments
                        </span>
                      )}
                    </div>
                    
                    {section.assignments.map(assignment => (
                      <div key={assignment.id} className="mb-3 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium">{assignment.title}</h5>
                        <p className="text-sm mt-1">{assignment.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Due: {assignment.dueDate}</p>
                        {assignment.pdfFile && (
                          <a 
                            href={assignment.pdfFile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 text-xs mt-1 inline-block"
                          >
                            Download PDF
                          </a>
                        )}
                        {user.role === 'student' && !assignment.submitted && (
                          <button
                            onClick={() => handleSubmitAssignment(section.id, assignment.id)}
                            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Submit Assignment
                          </button>
                        )}
                        {assignment.submitted && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Submitted
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Assignment</h2>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewAssignment({...newAssignment, pdfFile: event.target.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCourse;