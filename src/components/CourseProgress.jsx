import React from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { ProgressBar, CircularProgress } from './ProgressBar';

export function CourseProgressCard({ courseId, courseName, totalLessons }) {
  const { getCourseProgress } = useProgress();
  const progress = getCourseProgress(courseId);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        display: 'flex',
        gap: 20,
        alignItems: 'center',
      }}
    >
      <CircularProgress progress={progress.progress || 0} size={80} />
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          {courseName}
        </h3>
        <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          {progress.completedCount || 0} of {totalLessons} lessons completed
        </div>
        <ProgressBar progress={progress.progress || 0} height={6} showLabel={false} />
      </div>
    </div>
  );
}

export function LessonItem({ courseId, lessonId, lessonName, lessonNumber, duration }) {
  const { isLessonCompleted, updateProgress } = useProgress();
  const completed = isLessonCompleted(courseId, lessonId);

  const handleToggle = async () => {
    await updateProgress(courseId, lessonId, !completed);
  };

  return (
    <div
      style={{
        padding: 16,
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={handleToggle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${completed ? 'var(--color-success)' : 'var(--color-border)'}`,
          backgroundColor: completed ? 'var(--color-success)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: 'white',
          flexShrink: 0,
        }}
      >
        {completed && '✓'}
      </div>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          flexShrink: 0,
        }}
      >
        {lessonNumber}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            textDecoration: completed ? 'line-through' : 'none',
            opacity: completed ? 0.7 : 1,
          }}
        >
          {lessonName}
        </div>
        {duration && (
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {duration} min
          </div>
        )}
      </div>
      {completed && (
        <div
          style={{
            padding: '4px 12px',
            backgroundColor: 'var(--color-success)',
            color: 'white',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Completed
        </div>
      )}
    </div>
  );
}

export function ProgressSummary() {
  const { courseProgress, getOverallProgress } = useProgress();
  const overallProgress = getOverallProgress();
  const courses = Object.values(courseProgress);
  const totalCompleted = courses.reduce((sum, c) => sum + (c.completedCount || 0), 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.totalCount || 0), 0);

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
      }}
    >
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
        Your Learning Progress
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
        <CircularProgress progress={overallProgress} size={120} strokeWidth={10} />
        <div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: 8 }}>
            {overallProgress.toFixed(0)}%
          </div>
          <div style={{ fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Overall Progress
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {totalCompleted} of {totalLessons} lessons completed
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {courses.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Courses Enrolled
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--color-success)' }}>
            {courses.filter(c => c.progress === 100).length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Courses Completed
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--color-warning)' }}>
            {courses.filter(c => c.progress > 0 && c.progress < 100).length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            In Progress
          </div>
        </div>
      </div>
    </div>
  );
}
