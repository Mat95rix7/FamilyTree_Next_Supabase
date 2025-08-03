import { LoginForm } from '../../components/LoginForm';

const LoginPage = () => {

  return (
        <div className="flex h-screen">         
          {/* Section Connexion */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-screen dark-bg-animated p-5">
            <div className="relative flex flex-col items-center justify-center 
              bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl w-full max-w-xl py-10 
              shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 
              border border-gray-700 hover:border-amber-500 animate-fade-in">
              <LoginForm />
            </div>
          </div>
        </div>
  );
}

export default LoginPage;