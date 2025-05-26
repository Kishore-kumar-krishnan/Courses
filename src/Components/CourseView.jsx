import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const allCourses = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Course ${i + 1}`,
    category: ['Math', 'Science', 'Programming', 'Art'][i % 4],
    description: `This is a short description for Course ${i + 1}.`,
    longDescription: `This is a detailed and expanded description for Course ${i + 1}. It covers all the key aspects and learning outcomes of the course, providing students with a comprehensive overview of what to expect.`,
    image: `https://source.unsplash.com/400x250/?course,${['math','science','programming','art'][i%4]},${i+1}`,
    author: `Author ${i % 5 + 1}`,
    createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    sections: [
      {
        title: 'Section 1',
        content: 'Detailed content for section 1...',
        duration: '2 hours'
      },
      {
        title: 'Section 2',
        content: 'Detailed content for section 2...',
        duration: '3 hours'
      },
      {
        title: 'Section 3',
        content: 'Detailed content for section 3...',
        duration: '1.5 hours'
      }
    ]
  }));

  useEffect(() => {
    // Simulate API call
    const fetchCourse = () => {
      const foundCourse = allCourses.find(c => c.id === parseInt(id));
      setCourse(foundCourse);
      
      // Check enrollment status (replace with actual check)
      const enrolled = localStorage.getItem(`enrolled_${id}`) === 'true';
      setIsEnrolled(enrolled);
      setLoading(false);
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = () => {
    // Simulate enrollment
    localStorage.setItem(`enrolled_${id}`, 'true');
    setIsEnrolled(true);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!course) return <div className="text-center py-10">Course not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">
              {course.category}
            </span>
            <span className="text-gray-600">By {course.author}</span>
            <span className="text-gray-600">Created: {course.createdAt}</span>
          </div>
          <p className="text-lg mb-6">{course.longDescription}</p>
          
          {!isEnrolled ? (
            <button
              onClick={handleEnroll}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Enroll Now
            </button>
          ) : (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
              You're enrolled in this course
            </div>
          )}
        </div>
      </div>

      {/* Course Content (only shown if enrolled) */}
      {isEnrolled && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          <div className="space-y-4">
            {course.sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                  <h3 className="font-medium">{section.title}</h3>
                  <span className="text-sm text-gray-500">{section.duration}</span>
                </div>
                <div className="p-5">
                  <p>{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;