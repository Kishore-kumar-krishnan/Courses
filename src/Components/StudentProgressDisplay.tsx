import axios from "axios";
import React, { useState, useEffect , useContext} from "react";
import { AuthContext } from "../context/AuthContext";

type StudentProgressDisplayProps = {
  courseId: string;
  studentId: string;
};
type Student = {
    studentRollNumber: string;
    studentName: string;
    studentDepartment: string;
    progressPercentage: number;
    averageGrade: string | number;
};

function useStudentProgress(courseId: string, studentId: string) {
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    const fetchProgress = async () => {
     try {
                setLoading(true);
                // Replace 'courseId' with the actual course ID variable or value
                const response = await axios.get(`https://assignmentservice-2a8o.onrender.com/api/submissions/courses/${courseId}/student-progress`);
                
                const userProgress = response.data.students.find(
                  (student: Student) => student.studentRollNumber === user?.rollnumber
                );
                setPercentage((userProgress) ? userProgress : 0);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching progress data:', error);
            } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId, studentId]);

  return { percentage, loading, error };
}

export const StudentProgressDisplay = ({ courseId, studentId }: StudentProgressDisplayProps) => {
  const { percentage, loading, error } = useStudentProgress(courseId, studentId);
    console.log("user percentage: ",percentage);
    
  if (loading) {
    return (
      <div className="text-center py-4">Loading progress...</div>
    );
  }

  if (error) {
    return (
       <div className="text-red-500 text-center py-4">{error}</div>
    );
  }

  return (
    <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-800 font-medium">
           Percentage Completed
          </span>
          <span className="text-sm text-gray-800 font-bold">
            {percentage} %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gray-800 to-gray-800 h-3 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
  );
};
export default StudentProgressDisplay;