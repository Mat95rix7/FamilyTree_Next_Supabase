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
    }
  }, [initialData, mode]);

  // Charger la liste des personnes
  useEffect(() => {
    apiFetch("/personnes")
      .then((res) => res.json())
      .then((data) => setPersonnes(data))
      .catch((error) => console.error("Erreur lors du chargement des personnes:", error));
  }, []);

  // Réinitialiser le conjoint si le genre change et n'est plus compatible
  useEffect(() => {
    if (conjoint && gender) {
      const selectedConjoint = personnes.find(p => p.id.toString() === conjoint.toString());
      if (selectedConjoint) {
        const expectedGender = gender === "Homme" ? "Femme" : "Homme";
        if (selectedConjoint.gender !== expectedGender) {
          setConjoint(""); // Réinitialiser si incompatible
        }
      }
    }
  }, [gender, conjoint, personnes]);

  // Fonctions de filtrage par genre
  const getFilteredPersonnes = (targetGender, excludeSelf = true) => {
    return personnes.filter(p => {
      // Exclure la personne elle-même en mode édition
      if (excludeSelf && mode === "edit" && initialData && p.id === initialData.id) {
        return false;
      }
      // Filtrer par genre
      return p.gender === targetGender;
    });
  };

  const getConjointOptions = () => {
    if (!gender) return []; // Pas d'options si le genre n'est pas sélectionné
    
    // Si la personne est un homme, montrer les femmes
    // Si la personne est une femme, montrer les hommes
    const targetGender = gender === "Homme" ? "Femme" : "Homme";
    return getFilteredPersonnes(targetGender, true);
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
            <label className="block text-cyan-300 font-semibold mb-1">Père</label>
            <select 
              value={father} 
              onChange={e => setFather(e.target.value)} 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white"
            >
              <option value="">--Aucun--</option>
              {getFilteredPersonnes("Homme", true).map(p => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-cyan-300 font-semibold mb-1">Mère</label>
            <select 
              value={mother} 
              onChange={e => setMother(e.target.value)} 
              className="w-full p-2 rounded bg-gray-800 border border-cyan-400 text-white"
            >
              <option value="">--Aucune--</option>
              {getFilteredPersonnes("Femme", true).map(p => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </option>
              ))}
            </select>
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