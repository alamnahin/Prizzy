import React from 'react';
import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

const Stub = ({ title }) => (
  <div className="max-w-3xl mx-auto px-4 py-20 text-center">
    <div className="w-20 h-20 mx-auto rounded-full bg-brand-gradient-soft flex items-center justify-center mb-5">
      <Construction size={36} className="text-brand-pink" />
    </div>
    <h1 className="text-3xl font-extrabold text-brand-dark mb-3">{title}</h1>
    <p className="text-gray-500 mb-6">This page is part of the Prizzy preview — coming up next in our build.</p>
    <Link to="/" className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90">Back to Home</Link>
  </div>
);

export default Stub;
