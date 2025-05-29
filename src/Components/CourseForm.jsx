import { useState, useEffect } from 'react';
const CourseForm = ({ 
  onClose, 
  onSave, 
  departments = [], 
  isEditMode = false, 
  initialData = null 
}) => {
  // Default departments if none are provided
  const defaultDepartments = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
  const availableDepartments = departments.length > 0 ? departments : defaultDepartments;
  
  const [formData, setFormData] = useState({
    course_id: '',
    courseTitle: '',
    courseDescription: '',
    instructorName: '',
    dept: '',
    duration: '0',
    credit: '0',
    isActive: true
  });

  // Initialize form with existing data when initialData changes
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        course_id: initialData.course_id,
        courseTitle: initialData.courseTitle || '',
        courseDescription: initialData.courseDescription || '',
        instructorName: initialData.instructorName || '',
        dept: initialData.dept || availableDepartments[0],
        duration: initialData.duration?.toString() || '0',
        credit: initialData.credit?.toString() || '0',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate numbers
    const duration = Number(formData.duration);
    const credit = Number(formData.credit);
    
    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration (must be positive number)');
      return;
    }
    
    if (isNaN(credit) || credit <= 0) {
      alert('Please enter valid credits (must be positive number)');
      return;
    }
    
    // Call parent save handler with properly formatted data
    onSave({
      ...formData,
      duration,
      credit
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              name="courseTitle"
              value={formData.courseTitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Course Description</label>
            <textarea
              name="courseDescription"
              value={formData.courseDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Instructor Name</label>
            <input
              type="text"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Department</label>
            <input
              type='text'
              name="dept"
              placeholder='Eg: CSE/IT/MECH/ECE'
              value={formData.dept}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Duration (hours)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              min="1"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Credits</label>
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              min="1"
              max="10"
              required
            />
          </div>

          {isEditMode && (
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700">Active Course</label>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditMode ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;