import React from "react";
import Navbar from "../components/Navbar";

const JobsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Jobs</h1>
        <p className="text-lg text-gray-600">This is the jobs page. Content coming soon.</p>
      </div>
    </div>
  );
};

export default JobsPage;