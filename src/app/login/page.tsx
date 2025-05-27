import LoginForm from '@/components/Auth/LoginForm';

export const metadata = {
  title: 'Log In - BrandWisp',
  description: 'Log in to your BrandWisp account to manage your e-commerce stores.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Log in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <a href="/signup" className="font-medium text-primary hover:text-primary/90">
            create a new account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 