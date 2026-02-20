import React from 'react';

const Register = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form>
          <input 
            type="text" 
            placeholder="Name" 
            className="w-full p-2 mb-4 border rounded"
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-2 mb-4 border rounded"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-2 mb-4 border rounded"
          />
          <button className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
