import { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayAssignments = ({ courseId, showAssignments }) => {
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Fetch assignments when component mounts or courseId changes
  useEffect(() => {
    if (showAssignments) {
      fetchAssignments();
    }
  }, [showAssignments, courseId]);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const response = await axios.get(
        `https://6838896d2c55e01d184da3a5.mockapi.io/api/course/assignments/courseassignment`
      );
      // If API returns a single object, wrap it in an array
       const exactMatches = response.data.filter(assignment => 
        assignment.course_id === courseId.toString()
      );

      setAssignments(exactMatches);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleSubmitAssignment = (assignmentId) => {
    // Implement your assignment submission logic here
    console.log("Submitting assignment:", assignmentId);
    // You might open a modal or navigate to a submission page
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assignments</h2>
      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                  Due: {new Date(assignment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{assignment.description}</p>
              {assignment.fileno && (
                <p className="text-sm text-gray-500 mt-1">
                  File No: {assignment.fileno}
                </p>
              )}
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {assignment.resourcelink ? (
                    <a 
                      href={assignment.resourcelink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Resources
                    </a>
                  ) : 'No resources available'}
                </span>
                <button 
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  onClick={() => handleSubmitAssignment(assignment.assignment_id)}
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          {loadingAssignments ? 'Loading assignments...' : 'No assignments available'}
        </div>
      )}
    </div>
  );
};

export default DisplayAssignments;