import React from 'react';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

const NotFound = () => (
  <div className="max-w-3xl mx-auto px-4 py-20 text-center">
    <div className="w-20 h-20 mx-auto rounded-full bg-brand-gradient-soft flex items-center justify-center mb-5">
      <Gift size={36} className="text-brand-pink" />
    </div>
    <h1 className="text-5xl font-extrabold text-gradient mb-3">404</h1>
    <p className="text-gray-600 mb-6">Oops! The gift you're looking for is not here.</p>
    <Link to="/" className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90">Back to Home</Link>
  </div>
);

export default NotFound;
