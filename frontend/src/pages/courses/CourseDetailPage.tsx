import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Course } from '../../types';

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${slug}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post('/enrollments', { courseId: course?.id });
      navigate('/dashboard');
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {course.thumbnailUrl && (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>
          <div className="flex items-center space-x-4 mb-6">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">{course.category}</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">{course.level}</span>
          </div>
        </div>
        <div>
          <div className="card sticky top-4">
            <div className="text-3xl font-bold text-primary-600 mb-4">${course.price}</div>
            <button onClick={handleEnroll} className="w-full btn-primary mb-4">
              Enroll Now
            </button>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Lifetime access</p>
              <p>✓ Certificate of completion</p>
              <p>✓ 30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
