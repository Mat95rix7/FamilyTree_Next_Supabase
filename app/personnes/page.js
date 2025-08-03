"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../services/FetchAPI";
import PersonCard from "../components/PersonCard";
import { useAuth } from "../context/AuthContext";

export default function PersonnesList() {
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const { role } = useAuth();
  const isAdmin = role === "admin";

  useEffect(() => {
    apiFetch("/personnes")
      .then((res) => res.json())
      .then((data) => {
        setPersonnes(data);
        setLoading(false);
      });
  }, []);

  const sortOptions = [
  { key: "last_name", label: "Nom" },
  { key: "first_name", label: "Prénom" },
  { key: "gender", label: "Genre" },
  { key: "birth_date", label: "Année" },
];

  // Recherche
  const filtered = personnes.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.birth_place}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Tri
  const sorted = [...filtered].sort((a, b) => {
    const key = sortConfig.key;
    if (!key) return 0;

    let aVal = a[key] || "";
    let bVal = b[key] || "";

    if (key === "birth_date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

const handleSort = (key) => {
  const direction =
    sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
  setSortConfig({ key, direction });
};


  if (loading)
    return (
      <div className="text-center text-cyan-400 mt-10 text-xl">Chargement...</div>
    );

  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold text-cyan-300 mb-6 mx-5 md:mx-0">Liste des personnes</h1>

      {/* Barre de recherche et bouton */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 shadow-lg mx-5 md:mx-0">
          <div className="flex items-center w-full gap-2">
          <label
            htmlFor="search"
            className="text-cyan-100 font-medium whitespace-nowrap"
          >
            Rechercher :
          </label>
          <input
            id="search"
            type="text"
            placeholder="Nom, prénom, lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 w-full sm:w-auto"
          />
          </div>
          {isAdmin && (
            <Link
              href="/personnes/new"
              className="font-bold py-2 px-6 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white shadow w-full sm:w-auto text-center whitespace-nowrap"
            >
              + Ajouter une personne
            </Link>
          )}
        </div>
      </div>

      {/* Tri */}
      <div className="flex flex-wrap items-center ps-4 gap-2 mb-4 text-sm">
        <span className="text-gray-400">Trier par :</span>
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-3 py-1 rounded-full text-white ${
              sortConfig.key === key
                ? "bg-cyan-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {label}{" "}
            {sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
          </button>
        ))}
      </div>
      {/* Affichage cartes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.length > 0 ? (
          sorted.map((personne) => (
            <PersonCard key={personne.id} personne={personne} />
          ))
        ) : (
          <div className="text-center text-gray-400 col-span-full">
            {searchTerm
              ? `Aucune personne trouvée pour "${searchTerm}"`
              : "Aucune personne trouvée."}
          </div>
        )}
      </div>

      {/* Résultat count */}
      {searchTerm && (
        <div className="mt-4 text-center text-cyan-300">
          {sorted.length} personne{sorted.length > 1 ? "s" : ""} trouvée
          {sorted.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
