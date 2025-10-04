const CoursePlayerPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Video Player</h2>
          <p>Course content will be displayed here</p>
        </div>
      </div>
      <div className="bg-white p-4 border-t">
        <h3 className="font-semibold">Lesson Title</h3>
        <div className="flex items-center space-x-4 mt-2">
          <button className="btn-secondary">Previous</button>
          <button className="btn-primary">Next Lesson</button>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
