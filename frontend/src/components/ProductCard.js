import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = () => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Image Placeholder</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Product Name</h3>
        <p className="text-gray-600 mb-2 text-sm">Brief description of the product...</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">$99.99</span>
          <Link to="/product/1" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
