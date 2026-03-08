import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="text-[120px] font-extrabold text-stone-200 leading-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-16 h-16 text-[#2d6a4f]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Page Not Found</h1>
        <p className="text-stone-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          to="/"
          className="btn-primary inline-flex"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
