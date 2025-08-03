'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SuccessModal from './SuccessModal';
import { useAuth } from '../context/AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  // Fonction de validation de l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Gestion de la validation de l'email en temps réel
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Format d\'email invalide');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorAuth('');

    // Validation avant soumission
    if (!validateEmail(email)) {
      setEmailError('Veuillez saisir un email valide');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorAuth('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const data = await login({ email, password });

      if (!data) {
        setErrorAuth('Identifiants invalides');
        return;
      }

      if (data) {
          setShowModal(true);
          setTimeout(() => {
            setShowModal(false);
            router.push('/')
          }, 2000);
      }
    } catch (error) {     
        setErrorAuth(error.code || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className='w-full max-w-xs '>
        <h1 className="text-4xl mb-10 text-amber-500 font-bold capitalize text-center">
          Connexion
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-xs">
          <div className="mb-3">
            <input
              className={`w-full p-4 text-lg border text-gray-500 rounded-md ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && (
              <p className="mt-3 text-center text-sm text-amber-500">{emailError}</p>
            )}
          </div>
          
          <input
            className="mb-3 p-4 text-lg border text-gray-500 border-gray-300 rounded-md"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          
          {errorAuth && <p className="mb-3 text-center text-sm text-amber-500">{errorAuth}</p>}

          <button
            type="submit"
            disabled={isLoading || emailError}
            className="!bg-gradient-to-t from-amber-400 to-amber-700 text-white !text-xl font-bold !py-4 px-4 rounded-md hover:bg-amber-600 transition-colors duration-300 ease-in-out disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className='text-white text-sm text-center mt-3'>
            Vous n&apos;avez pas de compte ? 
            <Link href="/auth/register" className='!text-amber-400'> Inscrivez-Vous</Link>
          </p>
        </form>
        <SuccessModal showModal={showModal} setShowModal={setShowModal} type="connexion" />
      </div>
  );
}