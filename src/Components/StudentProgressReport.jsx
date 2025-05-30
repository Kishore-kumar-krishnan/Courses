import axios from "axios";
import React, { useState, useEffect } from "react";

const StudentProgressReport = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch student progress data when component mounts
        const fetchProgressData = async () => {
            try {
                setLoading(true)
                const response = await axios.get('https://assignmentservice-2a8o.onrender.com/api/submissions/courses/EC01/student-progress');
                // const data = await response.json();
                setStudents(response.data.students);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching progress data:', error);
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
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                            <tr key={student.studentRollNumber}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentRollNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentDepartment}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.progressPercentage}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.averageGrade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )};
        </div>
    );
};

export default StudentProgressReport;