import { useState, useEffect } from 'react';
import axios from 'axios';

interface Assignment {
  assignment_id: string;
  courseId: string;
  title: string;
  description: string;
  createdAt: string;
  fileno?: string;
  resourcelink?: string;
}
interface ApiResponse {
  assignments: Assignment[];
  message: string;
}

interface DisplayAssignmentsProps {
  courseId: string | number;
  showAssignments: boolean;
}

const DisplayAssignments: React.FC<DisplayAssignmentsProps> = ({ courseId, showAssignments }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    if (showAssignments) {
      fetchAssignments(courseId.toString());
    }
    // eslint-disable-next-line
  }, [showAssignments, courseId]);

  const fetchAssignments = async (courseId: string): Promise<Assignment[]> => {
    setLoadingAssignments(true);
    try {
      const response = await axios.get<ApiResponse>(
        'https://assignmentservice-2a8o.onrender.com/api/assignments/course?',
        {
          params: { courseId }
        }
      );
      
      console.log('Full response:', response.data);
      console.log('Assignments array:', response.data.assignments);
      setAssignments(response.data.assignments);
      return response.data.assignments;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
      return [];
    } finally {
      setLoadingAssignments(false);
    }
  };
  
  const handleSubmitAssignment = (assignmentId: string) => {
    // Implement your assignment submission logic here
    console.log("Submitting assignment:", assignmentId);
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