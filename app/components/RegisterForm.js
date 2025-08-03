'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateField } from '../services/errorMessages';
import  Link  from 'next/link';
import  SuccessModal  from './SuccessModal';
import { useAuth } from '../context/AuthContext';


const RegisterForm = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState("");
  const [validUsername, setValidUsername] = useState("")
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const { register } = useAuth();


  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: ''
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
 
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);  
    if(validation) {
      setIsLoading(false);
      return
    }
    try {
          const data = await register({
                                 username: formData.username, 
                                 email: formData.email, 
                                 password : formData.password
                                });
          if (data) {        
            setShowModal(true);
            setTimeout(() => {
              setShowModal(false);
              router.push('/');
            }, 2000);
          }

      } catch (error) {
          console.error('Inscription echouee :', error);
           
        } finally {
          setIsLoading(false);
        }
      }

  return (
    <div className='w-full max-w-xs'>
      <h1 className="text-4xl text-amber-500 font-bold capitalize text-center">
          Inscription
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-xs">

          <input
            className="mb-3 !p-4 !text-lg border text-gray-500 !border-gray-300 rounded-md"
            type="text"
            placeholder="Nom d'utilisateur"
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && (
              <p className="mb-3 text-center text-sm text-amber-500">{errors.username}</p>
            )}
          {validUsername && (
              <p className="mb-3 text-center text-sm text-amber-500">{validUsername}</p>
            )}
            
          <input
            className="mb-3 p-4 text-lg border text-gray-500 border-gray-300 rounded-md"
            type="email"
            name='email'
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
              <p className="mb-3 text-center text-sm text-amber-500">{errors.email}</p>
            )}
            
          <input
            className="mb-3 p-4 text-lg border text-gray-500 border-gray-300 rounded-md"
            type="password"
            name='password'
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
            {errors.password && (
              <p className="mb-3 text-center text-sm text-amber-500">{errors.password}</p>
            )}
          <p className="mb-3 text-center text-sm text-amber-500">{validation}</p>
            
        <button
          type="submit"
          disabled={isLoading}
          className="!bg-gradient-to-t from-amber-400 to-amber-700 text-white !text-2xl font-bold py-4 px-4 rounded-md hover:bg-amber-600 transition-colors duration-300 ease-in-out disabled:opacity-50"
        >
          {isLoading ? 'Inscription...' : 'Inscription'}
        </button>
        <p className='text-white text-center mt-3 text-sm'>Vous avez déjà un compte ? <Link href="/auth/login" className='text-amber-400'>Connectez-vous</Link></p>
      </form>

      <SuccessModal 
          showModal={showModal}
          setShowModal={setShowModal}
          type="inscription"
        />

      </div>
  );
}

export default RegisterForm;