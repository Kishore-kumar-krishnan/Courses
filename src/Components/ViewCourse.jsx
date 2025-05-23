// src/components/ViewCourse.js
import React, { useState,useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

function ViewCourse() {
    const { id } = useParams();
    const { state } = useLocation();
    const [course, setCourse] = useState(state?.course || null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(!state?.course);

    // Check enrollment status
    useEffect(() => {
        if (!course) {
            // Fallback if navigation didn't pass state
            const foundCourse = allCourses.find(c => c.id === parseInt(id));
            setCourse(foundCourse);
            setLoading(false);
        }
        
        const enrolled = localStorage.getItem(`enrolled_${id}`) === "true";
        setIsEnrolled(enrolled);
    }, [id, course]);

    const handleEnroll = () => {
        localStorage.setItem(`enrolled_${id}`, "true");
        setIsEnrolled(true);
    };

    const handleSubmitAssignment = (sectionIndex, assignmentId) => {
        // Update assignment submission status
        const updatedCourse = { ...course };
        updatedCourse.sections[sectionIndex].assignments.find(
            a => a.id === assignmentId
        ).submitted = true;
        setCourse(updatedCourse);
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!course) return <div className="text-center py-10">Course not found</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Course Header (same as before) */}
            
            {/* Syllabus Download */}
            {isEnrolled && (
                <div className="mb-8">
                    <a 
                        href={course.syllabusPdf} 
                        download
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Download Syllabus (PDF)
                    </a>
                </div>
            )}

            {/* Course Content */}
            {isEnrolled && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                    <div className="space-y-6">
                        {course.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                                    <h3 className="font-medium">{section.title}</h3>
                                    <span className="text-sm text-gray-500">{section.duration}</span>
                                </div>
                                <div className="p-5">
                                    <p className="mb-4">{section.content}</p>
                                    
                                    {/* Assignments */}
                                    {section.assignments.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold mb-2">Assignments:</h4>
                                            {section.assignments.map(assignment => (
                                                <div key={assignment.id} className="mb-3 p-3 bg-gray-50 rounded">
                                                    <h5 className="font-medium">{assignment.title}</h5>
                                                    <p className="text-sm">{assignment.description}</p>
                                                    <p className="text-xs text-gray-500">Due: {assignment.dueDate}</p>
                                                    {assignment.submitted ? (
                                                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                            Submitted
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSubmitAssignment(sectionIndex, assignment.id)}
                                                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                        >
                                                            Submit Assignment
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewCourse;