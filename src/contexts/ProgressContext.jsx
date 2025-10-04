import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [courseProgress, setCourseProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/progress');
      setCourseProgress(data.progress || {});
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (courseId, lessonId, completed) => {
    try {
      await api.post(`/progress/${courseId}/${lessonId}`, { completed });
      
      setCourseProgress((prev) => {
        const course = prev[courseId] || { lessons: {}, completedCount: 0, totalCount: 0 };
        const wasCompleted = course.lessons[lessonId] || false;
        
        const newLessons = { ...course.lessons, [lessonId]: completed };
        const completedCount = Object.values(newLessons).filter(Boolean).length;
        
        return {
          ...prev,
          [courseId]: {
            ...course,
            lessons: newLessons,
            completedCount,
            progress: course.totalCount > 0 ? (completedCount / course.totalCount) * 100 : 0,
          },
        };
      });

      return true;
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  };

  const getCourseProgress = (courseId) => {
    return courseProgress[courseId] || { 
      lessons: {}, 
      completedCount: 0, 
      totalCount: 0, 
      progress: 0 
    };
  };

  const isLessonCompleted = (courseId, lessonId) => {
    return courseProgress[courseId]?.lessons[lessonId] || false;
  };

  const getOverallProgress = () => {
    const courses = Object.values(courseProgress);
    if (courses.length === 0) return 0;
    
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return totalProgress / courses.length;
  };

  const resetCourseProgress = async (courseId) => {
    try {
      await api.delete(`/progress/${courseId}`);
      
      setCourseProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[courseId];
        return newProgress;
      });

      return true;
    } catch (error) {
      console.error('Failed to reset progress:', error);
      return false;
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        courseProgress,
        isLoading,
        updateProgress,
        getCourseProgress,
        isLessonCompleted,
        getOverallProgress,
        resetCourseProgress,
        loadProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
}
