const InstructorDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Instructor Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Students</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Active Courses</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">$0</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        <p className="text-gray-600">No courses yet. Create your first course to get started!</p>
      </div>
    </div>
  );
};

export default InstructorDashboard;
