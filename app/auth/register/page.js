import RegisterForm  from '../../components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex">

      {/* Section Inscription */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-5">
        <div className="relative flex flex-col items-center justify-center 
          bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl w-full max-w-xl py-10 
          shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 
          border border-gray-700 hover:border-amber-500 animate-fade-in">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;