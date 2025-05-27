import SignUpForm from '@/components/Auth/SignUpForm';

export const metadata = {
  title: 'Sign Up - BrandWisp',
  description: 'Create your BrandWisp account and start selling more with AI-powered tools.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <a href="/login" className="font-medium text-primary hover:text-primary/90">
            sign in to your existing account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
} 