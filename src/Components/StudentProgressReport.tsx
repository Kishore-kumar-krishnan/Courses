import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

type Student = {
  studentRollNumber: string;
  studentName: string;
  studentDepartment: string;
  progressPercentage: number;
  averageGrade: string | number;
};
type StudentProgressReportProps = {
  courseId: any;
};

const StudentProgressReport = ({ courseId }: StudentProgressReportProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    // Fetch student progress data when component mounts
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        // Replace 'courseId' with the actual course ID variable or value
        const response = await axios.get(
          `https://assignmentservice-2a8o.onrender.com/api/submissions/courses/${courseId}/student-progress`
        );
        setStudents(response.data.students);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching progress data:", error);
      }
    };

    fetchProgressData();
  }, []);

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Reports Available
          </h3>
          <p className="text-gray-500 max-w-md">
            {user?.role === "teacher"
              ? "No student submissions have been recorded for this course yet."
              : "Your progress report is not yet available. Please check back later."}
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr key={student.studentRollNumber}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.studentRollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.studentDepartment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.progressPercentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.averageGrade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentProgressReport;
