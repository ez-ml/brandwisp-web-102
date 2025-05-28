import LoginForm from '@/components/Auth/LoginForm';
// import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export const metadata = {
  title: 'Log In - BrandWisp',
  description: 'Log in to your BrandWisp account to manage your e-commerce stores.',
};

export default function LoginPage() {
  return (
    // <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              BrandWisp
            </h1>
            <p className="text-gray-400 mt-2">AI-Powered E-commerce Management</p>
          </div>
          
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Sign up for free
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border border-[#3D3A6E] backdrop-blur-sm shadow-2xl py-8 px-4 sm:rounded-xl sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
    // </ProtectedRoute>
  );
} 