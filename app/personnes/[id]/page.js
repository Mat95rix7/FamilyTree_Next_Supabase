"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CakeIcon,
  MapPinIcon,
  UserIcon,
  HeartIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { apiFetch, getPhotoUrl } from "../../services/FetchAPI";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import { Trees, TreesIcon } from "lucide-react";

function formatDateFR(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PersonneDetail() {
  const { id } = useParams();
  const [personne, setPersonne] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { role } = useAuth();
  const isAdmin = role === 'admin';

  useEffect(() => {
    apiFetch(`/personnes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPersonne(data);
        setLoading(false);
      });
  }, [id]);

   const getIdFamille = () => {
    if (!personne?.conjointId) return null;
    if (personne?.gender === 'Homme') return personne.id;
    if (personne?.gender === 'Femme' && personne?.conjointId) return personne?.conjointId;
  return null;
};

  const handleDelete = async () => {
    if (confirm("Supprimer cette personne ?")) {
      const response = await apiFetch(`/personnes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/personnes");
      } else {
        alert("Erreur lors de la suppression !");
      }
    }
  };

  if (loading) return <div className="text-center text-cyan-400 mt-10 text-xl">Chargement...</div>;
  if (!personne) return <div className="text-center text-red-400 mt-10 text-xl">Personne non trouvée</div>;

  // Helpers pour afficher les champs liés
  const getNomPrenom = (obj) => obj ? `${obj.first_name || ''} ${obj.last_name || ''}`.trim() : 'Non renseigné';

  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-3xl mx-5 md:mx-auto card bg-gray-900 text-white mb-8 shadow-lg border-2 border-cyan-400 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 p-8">
          <div className="text-center">
            <Image
              src={getPhotoUrl(personne.photo) || ""}
              alt="Photo"
              width={150}
              height={150}
              className="rounded-full border-4 border-cyan-400 shadow-lg"
            />
            <div className="mt-2">
              <span className="inline-block bg-cyan-400 text-gray-900 text-sm font-semibold px-3 py-1 rounded-full">
                {personne.gender || 'Non renseigné'}
              </span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {personne.first_name} {personne.last_name}
              <span className="inline-block bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded ml-2 align-middle">
                {personne.age ? `${personne.age} ans` : ''}
              </span>
            </h2>
            <ul className="divide-y divide-gray-800 mb-3">
              <li className="flex items-center gap-2 py-2">
                <CakeIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-cyan-400 w-1/3 truncate">Date de naissance :</span>
                <span className="ml-1">{formatDateFR(personne.birth_date) || 'Non renseigné'}</span>
              </li>
              <li className="flex items-center gap-2 py-2">
                <MapPinIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-cyan-400 w-1/3 truncate">Lieu de naissance :</span>
                <span className="ml-1">{personne.birth_place || 'Non renseigné'}</span>
              </li>
              <li className="flex items-center gap-2 py-2">
                <UserIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-cyan-400 w-1/3">Père :</span>
                <span className="ml-1">{getNomPrenom(personne.father)}</span>
              </li>
              <li className="flex items-center gap-2 py-2">
                <UserIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-cyan-400 w-1/3">Mère :</span>
                <span className="ml-1">{getNomPrenom(personne.mother)}</span>
              </li>
              <li className="flex items-center gap-2 py-2">
                <HeartIcon className="w-5 h-5 text-pink-400" />
                <span className="font-semibold text-cyan-400 w-1/3">Conjoint :</span>
                <span className="ml-1">{getNomPrenom(personne.conjoint)}</span>
              </li>
            </ul>
            {personne.notes && (
              <div className="bg-cyan-900/30 border-l-4 border-cyan-400 text-cyan-100 py-2 px-4 mb-3 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-cyan-400" />
                {personne.notes}
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-center gap-3 mt-4">
              {/* Modifier + Supprimer groupés */}
              <div className="flex flex-row gap-3 w-full sm:w-auto">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => router.push(`/personnes/${id}/edit`)}
                      className="flex-1 sm:min-w-[110px] inline-flex items-center justify-center gap-2 !bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-2 px-4 rounded shadow-md hover:scale-105 transition text-base focus:outline-none"
                    >
                      <PencilSquareIcon className="w-5 h-5" /> Modifier
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 sm:min-w-[110px] inline-flex items-center justify-center gap-2 !bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold py-2 px-4 rounded shadow-md hover:scale-105 transition text-base focus:outline-none"
                      type="button"
                    >
                      <TrashIcon className="w-5 h-5" /> Supprimer
                    </button>
                  </>
                )}
              </div>
              {getIdFamille() && (
                <button
                  onClick={() => {
                      const id = getIdFamille(); 
                      router.push(`/familles/${id}/`)
                    }}
                  className="w-full sm:min-w-[110px] inline-flex items-center justify-center gap-2 !bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-2 px-4 rounded shadow-md hover:scale-105 transition text-base focus:outline-none"
                >
                  <TreesIcon className="w-5 h-5"/>Voir l’arbre généalogique
                </button>
              )}
              {/* Retour à la liste */}
              <button
                onClick={() => router.push(`/personnes`)}
                className="w-full sm:min-w-[110px] inline-flex items-center justify-center gap-2 !bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold py-2 px-4 rounded shadow-md hover:scale-105 transition text-base focus:outline-none"
              >
                <ArrowLeftIcon className="w-5 h-5" /> Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 