import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

const SuccessModal = ({ showModal, setShowModal, type }) => {

  if (!showModal) return null;
  
  const titre = {
    connexion: "Connexion réussie!",
    inscription: "Inscription réussie!",
  };

  const messages = {
    connexion: [
        "Bienvenue ! ",
        "Vous êtes bien connecté à votre compte."
    ],
    inscription: [
        "Félicitations ! ",
        "Votre inscription a été effectuée avec succès."
    ]
    
  };
  
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent 
          className="w-[90%] mx-auto max-w-sm sm:max-w-md p-1 overflow-hidden !bg-gradient-to-b from-white to-amber-50 rounded-lg shadow-lg border border-amber-100"
          >
        <DialogHeader className="text-center space-y-4 pt-8">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            {titre[type] || "Opération réussie!"}
          </DialogTitle>
          <DialogDescription className="text-gray-700 text-center text-base leading-relaxed">
            {messages[type][0]} <br />
            {messages[type][1]}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">

          <div 
            className="absolute -top-24 -left-24 w-48 h-48 bg-amber-100 rounded-full opacity-20 animate-pulse"
            aria-hidden="true"
          />
          <div 
            className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-100 rounded-full opacity-20 animate-pulse"
            aria-hidden="true"
          />
          
          <div className="relative p-6">
            {/* Conteneur de l'icône avec animation personnalisée */}
            <div className="flex items-center justify-center" role="presentation">
              <div className="bg-amber-100 p-4 rounded-full shadow-lg transform animate-[bounce_2s_ease-in-out_infinite]">
                <CheckCircle 
                  className="h-12 w-12 text-amber-600" 
                  aria-hidden="true"
                />
              </div>
            </div>
            
            {/* Barre de progression animée */}
            <div 
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={showModal ? 100 : 0}
              className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden border border-gray-200"
            >
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-3000 ease-in-out"
                style={{
                  width: showModal ? '100%' : '0%',
                  transition: 'width 3s linear'
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;