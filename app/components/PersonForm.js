"use client";
import { useEffect, useState } from "react";
import { UserIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { apiFetch } from "../services/FetchAPI";

export default function PersonForm({ 
  initialData = null, 
  mode = "add", // "add" ou "edit"
  onSuccess = null 
}) {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [birth_place, setBirthPlace] = useState("");
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [conjoint, setConjoint] = useState("");
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [date_deces, setDateDeces] = useState("");
  const [personnes, setPersonnes] = useState([]);
  const [showDateDeces, setShowDateDeces] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const maxAge = 20;
  const minAgeDifference = 15;

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFirstName(initialData.first_name || "");
      setLastName(initialData.last_name || "");
      setGender(initialData.gender || "");
      setBirthDate(initialData.birth_date || "");
      setBirthPlace(initialData.birth_place || "");
      setFather(initialData.fatherId || "");
      setMother(initialData.motherId || "");
      setConjoint(initialData.conjointId || "");
      setNotes(initialData.notes || "");
      setDateDeces(initialData.dateDeces || "");
      setShowDateDeces(!!initialData.dateDeces);
      setPhoto(initialData.photo || null);
    }
  }, [initialData, mode]);

  // Charger la liste des personnes
  useEffect(() => {
    apiFetch("/personnes")
      .then((res) => res.json())
      .then((data) => setPersonnes(data))
      .catch((error) => console.error("Erreur lors du chargement des personnes:", error));
  }, []);

  // Réinitialiser les relations si incompatibles après changement de données
  useEffect(() => {
    validateAndResetRelations();
  }, [gender, birth_date, personnes]);

  // Fonction pour calculer l'âge à partir d'une date de naissance
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fonction pour obtenir les enfants d'une personne (pour éviter les relations incestueuses)
  const getPersonChildren = (personId) => {
    if (!personId) return [];
    return personnes.filter(p => 
      p.fatherId?.toString() === personId.toString() || 
      p.motherId?.toString() === personId.toString()
    );
  };

  // Fonction pour obtenir les parents d'une personne
  const getPersonParents = (personId) => {
    if (!personId) return [];
    const person = personnes.find(p => p.id?.toString() === personId.toString());
    if (!person) return [];
    
    const parents = [];
    if (person.fatherId) {
      const father = personnes.find(p => p.id?.toString() === person.fatherId.toString());
      if (father) parents.push(father);
    }
    if (person.motherId) {
      const mother = personnes.find(p => p.id?.toString() === person.motherId.toString());
      if (mother) parents.push(mother);
    }
    return parents;
  };

  // Fonction pour vérifier si une personne est un descendant (enfant, petit-enfant, etc.)
  const isDescendant = (personId, ancestorId) => {
    if (!personId || !ancestorId) return false;
    
    const person = personnes.find(p => p.id?.toString() === personId.toString());
    if (!person) return false;
    
    // Vérification directe (parent)
    if (person.fatherId?.toString() === ancestorId.toString() || 
        person.motherId?.toString() === ancestorId.toString()) {
      return true;
    }
    
    // Vérification récursive (grands-parents, etc.)
    const parents = getPersonParents(personId);
    for (const parent of parents) {
      if (isDescendant(parent.id, ancestorId)) {
        return true;
      }
    }
    
    return false;
  };

  // Fonction pour vérifier si une personne est un ascendant (parent, grand-parent, etc.)
  const isAscendant = (personId, descendantId) => {
    return isDescendant(descendantId, personId);
  };

  // Fonction pour valider et réinitialiser les relations incompatibles
  const validateAndResetRelations = () => {
    const currentPersonId = initialData?.id;
    
    // Valider le père
    if (father && currentPersonId) {
      const fatherPerson = personnes.find(p => p.id?.toString() === father.toString());
      if (fatherPerson) {
        const fatherAge = calculateAge(fatherPerson.birth_date);
        const currentAge = calculateAge(birth_date);
        
        if (fatherAge < maxAge || 
            (currentAge > 0 && fatherAge - currentAge < minAgeDifference) ||
            isDescendant(father, currentPersonId) ||
            isAscendant(currentPersonId, father)) {
          setFather("");
        }
      }
    }
    
    // Valider la mère
    if (mother && currentPersonId) {
      const motherPerson = personnes.find(p => p.id?.toString() === mother.toString());
      if (motherPerson) {
        const motherAge = calculateAge(motherPerson.birth_date);
        const currentAge = calculateAge(birth_date);
        
        if (motherAge < maxAge || 
            (currentAge > 0 && motherAge - currentAge < minAgeDifference) ||
            isDescendant(mother, currentPersonId) ||
            isAscendant(currentPersonId, mother)) {
          setMother("");
        }
      }
    }
    
    // Valider le conjoint
    if (conjoint && currentPersonId) {
      const conjointPerson = personnes.find(p => p.id?.toString() === conjoint.toString());
      if (conjointPerson) {
        const conjointAge = calculateAge(conjointPerson.birth_date);
        const expectedGender = gender === "Homme" ? "Femme" : "Homme";
        
        if (conjointAge < maxAge ||
            conjointPerson.gender !== expectedGender ||
            isDescendant(conjoint, currentPersonId) ||
            isAscendant(currentPersonId, conjoint) ||
            isDescendant(currentPersonId, conjoint) ||
            isAscendant(conjoint, currentPersonId)) {
          setConjoint("");
        }
      }
    }
  };

  // Fonction pour filtrer les pères potentiels
  const getFatherOptions = () => {
    const currentPersonId = initialData?.id;
    const currentAge = calculateAge(birth_date);
    
    return personnes.filter(p => {
      // Doit être un homme
      if (p.gender !== "Homme") return false;
      
      // Ne pas s'inclure soi-même
      if (currentPersonId && p.id?.toString() === currentPersonId.toString()) return false;
      
      // Doit avoir au moins maxAge ans
      const age = calculateAge(p.birth_date);
      if (age < maxAge) return false;
      
      // Doit avoir au moins 15 ans de plus que la personne actuelle (si on connaît son âge)
      if (currentAge > 0 && age - currentAge < minAgeDifference) return false;

      // Ne peut pas être un descendant de la personne actuelle
      if (currentPersonId && isDescendant(p.id, currentPersonId)) return false;
      
      // Ne peut pas être un ascendant de la personne actuelle (éviter les boucles généalogiques)
      if (currentPersonId && isAscendant(currentPersonId, p.id)) return false;
      
      return true;
    });
  };

  // Fonction pour filtrer les mères potentielles
  const getMotherOptions = () => {
    const currentPersonId = initialData?.id;
    const currentAge = calculateAge(birth_date);
    
    return personnes.filter(p => {
      // Doit être une femme
      if (p.gender !== "Femme") return false;
      
      // Ne pas s'inclure soi-même
      if (currentPersonId && p.id?.toString() === currentPersonId.toString()) return false;
      
      // Doit avoir au moins maxAge ans
      const age = calculateAge(p.birth_date);
      if (age < maxAge) return false;

      // Doit avoir au moins 15 ans de plus que la personne actuelle (si on connaît son âge)
      if (currentAge > 0 && age - currentAge < minAgeDifference) return false;

      // Ne peut pas être un descendant de la personne actuelle
      if (currentPersonId && isDescendant(p.id, currentPersonId)) return false;
      
      // Ne peut pas être un ascendant de la personne actuelle (éviter les boucles généalogiques)
      if (currentPersonId && isAscendant(currentPersonId, p.id)) return false;
      
      return true;
    });
  };

  // Fonction pour filtrer les conjoints potentiels
  const getConjointOptions = () => {
    if (!gender) return [];
    
    const currentPersonId = initialData?.id;
    const targetGender = gender === "Homme" ? "Femme" : "Homme";
    
    return personnes.filter(p => {
      // Doit être du sexe opposé
      if (p.gender !== targetGender) return false;
      
      // Ne pas s'inclure soi-même
      if (currentPersonId && p.id?.toString() === currentPersonId.toString()) return false;
      
      // Doit avoir au moins maxAge ans
      const age = calculateAge(p.birth_date);
      if (age < maxAge) return false;
      
      // Ne peut pas être un enfant de la personne actuelle
      if (currentPersonId && isDescendant(p.id, currentPersonId)) return false;
      
      // Ne peut pas être un parent de la personne actuelle
      if (currentPersonId && isAscendant(p.id, currentPersonId)) return false;
      
      // Ne peut pas être dans la même lignée familiale directe
      if (currentPersonId && (isDescendant(currentPersonId, p.id) || isAscendant(currentPersonId, p.id))) return false;
      
      // Ne peut pas avoir de conjoint
      if (p.conjointId) return false;
      
      return true;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("gender", gender);
      formData.append("birth_date", birth_date);
      formData.append("birth_place", birth_place);
      if (father) formData.append("fatherId", father);
      if (mother) formData.append("motherId", mother);
      if (conjoint) formData.append("conjointId", conjoint);
      if (photo) formData.append("photo", photo);
      formData.append("notes", notes);
      if (date_deces) formData.append("dateDeces", date_deces);

      const url = mode === "edit" ? `/personnes/${initialData.id}` : "/personnes";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/personnes");
        }
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(`Erreur lors de ${mode === "edit" ? "la modification" : "l'ajout"} !`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setGender("");
    setBirthDate("");
    setBirthPlace("");
    setFather("");
    setMother("");
    setConjoint("");
    setPhoto(null);
    setNotes("");
    setDateDeces("");
    setShowDateDeces(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gray-900 rounded-xl shadow-lg p-8">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">
            {mode === "edit" ? "Modifier une personne" : "Ajouter une personne"}
          </h2>
        </div>

        <h4 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-cyan-400" />
          Identité
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Nom</label>
            <input 
              type="text" 
              value={last_name} 
              onChange={e => setLastName(e.target.value)} 
              required 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" 
            />
          </div>
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Prénom</label>
            <input 
              type="text" 
              value={first_name} 
              onChange={e => setFirstName(e.target.value)} 
              required 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Date de naissance</label>
            <input 
              type="date" 
              value={birth_date} 
              onChange={e => setBirthDate(e.target.value)} 
              required 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white" 
            />
          </div>
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Lieu de naissance</label>
            <input 
              type="text" 
              value={birth_place} 
              onChange={e => setBirthPlace(e.target.value)} 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Sexe</label>
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)} 
              required 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white"
            >
              <option value="">--Choisir--</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Photo</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setPhoto(e.target.files[0])} 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white" 
            />
          </div>
        </div>

        <hr className="my-6 border-cyan-700" />

        <h4 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-cyan-400" />
          Famille et relations
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">
              Père
            </label>
            <select 
              value={father} 
              onChange={e => setFather(e.target.value)} 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white"
            >
              <option value="">--Aucun--</option>
              {getFatherOptions().map(p => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </option>
              ))}
            </select>
            {getFatherOptions().length === 0 && (
              <p className="text-gray-400 text-sm mt-1">
                Aucun père potentiel disponible
              </p>
            )}
          </div>
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">
              Mère</label>
            <select 
              value={mother} 
              onChange={e => setMother(e.target.value)} 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white"
            >
              <option value="">--Aucune--</option>
              {getMotherOptions().map(p => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </option>
              ))}
            </select>
            {getMotherOptions().length === 0 && (
              <p className="text-gray-400 text-sm mt-1">
                Aucune mère potentielle disponible
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">
              Conjoint
            </label>
            <select 
              value={conjoint} 
              onChange={e => setConjoint(e.target.value)} 
              disabled={!gender}
              className={`w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white ${
                !gender ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">--Aucun--</option>
              {getConjointOptions().map(p => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </option>
              ))}
            </select>
            {gender && getConjointOptions().length === 0 && (
              <p className="text-gray-400 text-sm mt-1">
                Aucun {gender === "Homme" ? "femme" : "homme"} disponible
              </p>
            )}
            {!gender && (
              <p className="text-gray-400 text-sm mt-1">
                Veuillez d&apos;abord sélectionner le sexe
              </p>
            )}
          </div>
          <div>
            {!showDateDeces ? (
              <div>
                <label className="block text-cyan-300 font-semibold mb-1">+</label>
                <div
                  onClick={() => setShowDateDeces(true)}
                  className="text-cyan-400 font-bold text-lg px-2 py-1 rounded hover:bg-cyan-900/30 transition text-center cursor-pointer"
                >
                  Plus
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-cyan-300 font-semibold mb-1">Date de décès</label>
                <input
                  type="date"
                  value={date_deces}
                  onChange={e => setDateDeces(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-cyan-300 font-semibold mb-1">Notes</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white min-h-[80px] resize-vertical" 
          />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 font-bold py-2 px-8 rounded shadow-md hover:scale-105 hover:shadow-green-400 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-700" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          
          {mode === "add" && (
            <button 
              type="button"
              onClick={resetForm}
              className="bg-gray-600 text-white font-bold py-2 px-8 rounded shadow-md hover:bg-gray-700 transition"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </form>
    </div>
  );
}