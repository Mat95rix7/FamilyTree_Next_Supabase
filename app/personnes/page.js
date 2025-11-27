// "use client";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { apiFetch } from "../services/FetchAPI";
// import PersonCard from "../components/PersonCard";
// import { useAuth } from "../context/AuthContext";

// export default function PersonnesList() {
//   const [personnes, setPersonnes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

//   const { role } = useAuth();
//   const isAdmin = role === "admin";

//   useEffect(() => {
//     apiFetch("/personnes")
//       .then((res) => res.json())
//       .then((data) => {
//         setPersonnes(data);
//         setLoading(false);
//       });
//   }, []);

//   const sortOptions = [
//   { key: "last_name", label: "Nom" },
//   { key: "first_name", label: "Prénom" },
//   { key: "gender", label: "Genre" },
//   { key: "birth_date", label: "Année" },
// ];

//   // Recherche
//   const filtered = personnes.filter((p) =>
//     `${p.first_name} ${p.last_name} ${p.birth_place}`
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   // Tri
//   const sorted = [...filtered].sort((a, b) => {
//     const key = sortConfig.key;
//     if (!key) return 0;

//     let aVal = a[key] || "";
//     let bVal = b[key] || "";

//     if (key === "birth_date") {
//       aVal = new Date(aVal);
//       bVal = new Date(bVal);
//     } else {
//       aVal = aVal.toString().toLowerCase();
//       bVal = bVal.toString().toLowerCase();
//     }

//     if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
//     if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
//     return 0;
//   });

// const handleSort = (key) => {
//   const direction =
//     sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
//   setSortConfig({ key, direction });
// };


//   if (loading)
//     return (
//       <div className="text-center text-cyan-400 mt-10 text-xl">Chargement...</div>
//     );

//   return (
//     <div className="container py-8 mx-auto">
//       <h1 className="text-3xl font-bold text-cyan-300 mb-6 mx-5 md:mx-0">Liste des personnes ( {sorted.length} )</h1>

//       {/* Barre de recherche et bouton */}
//       <div className="mb-6">
//         <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 shadow-lg mx-5 md:mx-0">
//           <div className="flex items-center w-full gap-2">
//           <label
//             htmlFor="search"
//             className="text-cyan-100 font-medium whitespace-nowrap"
//           >
//             Rechercher :
//           </label>
//           <input
//             id="search"
//             type="text"
//             placeholder="Nom, prénom, lieu..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 w-full sm:w-auto"
//           />
//           </div>
//           {isAdmin && (
//             <Link
//               href="/personnes/new"
//               className="font-bold py-2 px-6 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white shadow w-full sm:w-auto text-center whitespace-nowrap"
//             >
//               + Ajouter une personne
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Tri */}
//       <div className="flex flex-wrap items-center ps-4 gap-2 mb-4 text-sm">
//         <span className="text-gray-400">Trier par :</span>
//         {sortOptions.map(({ key, label }) => (
//           <button
//             key={key}
//             onClick={() => handleSort(key)}
//             className={`px-3 py-1 rounded-full text-white ${
//               sortConfig.key === key
//                 ? "bg-cyan-600"
//                 : "bg-gray-700 hover:bg-gray-600"
//             }`}
//           >
//             {label}{" "}
//             {sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
//           </button>
//         ))}
//       </div>
//       {/* Affichage cartes */}
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {sorted.length > 0 ? (
//           sorted.map((personne) => (
//             <PersonCard key={personne.id} personne={personne} />
//           ))
//         ) : (
//           <div className="text-center text-gray-400 col-span-full">
//             {searchTerm
//               ? `Aucune personne trouvée pour "${searchTerm}"`
//               : "Aucune personne trouvée."}
//           </div>
//         )}
//       </div>

//       {/* Résultat count */}
//       {searchTerm && (
//         <div className="mt-4 text-center text-cyan-300">
//           {sorted.length} personne{sorted.length > 1 ? "s" : ""} trouvée
//           {sorted.length > 1 ? "s" : ""}
//         </div>
//       )}
//     </div>
//   );
// }

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

  // Fonction pour calculer les anniversaires à venir
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const daysToCheck = 30; // Anniversaires dans les 30 prochains jours

    return personnes
      .map((person) => {
        if (!person.birth_date) return null;

        const birthDate = new Date(person.birth_date);
        const birthdayThisYear = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate()
        );

        // Si l'anniversaire est déjà passé cette année, regarder l'année prochaine
        if (birthdayThisYear < today) {
          birthdayThisYear.setFullYear(currentYear + 1);
        }

        const daysUntilBirthday = Math.floor(
          (birthdayThisYear - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilBirthday >= 0 && daysUntilBirthday <= daysToCheck) {
          const age = currentYear - birthDate.getFullYear();
          return { ...person, daysUntilBirthday, age, birthdayDate: birthdayThisYear };
        }
        return null;
      })
      .filter((p) => p !== null)
      .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  if (loading)
    return (
      <div className="text-center text-cyan-400 mt-10 text-xl">Chargement...</div>
    );

  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold text-cyan-300 mb-6 mx-5 md:mx-0">
        Liste des personnes ({sorted.length})
      </h1>

{/* Section Anniversaires à venir */}
{upcomingBirthdays.length > 0 && (
  <div className="mb-8 mx-5 md:mx-0">
    <div className="relative">
      {/* Décoration de fond */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 rounded-xl blur-2xl pointer-events-none" />
      
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-xl p-6 shadow-2xl border border-cyan-500/30 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-500/20">
          <span className="text-3xl">🎂</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
            Anniversaires à venir
          </h2>
          <div className="ml-auto text-cyan-400 text-sm font-medium px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
            {upcomingBirthdays.length} {upcomingBirthdays.length > 1 ? "événements" : "événement"}
          </div>
        </div>

        {/* Grid des anniversaires */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingBirthdays.map((person) => (
            <div key={person.id} className="group relative">
              
              {/* Glow effect au survol */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200" />

              {/* CARTE — ajout de h-full */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-cyan-500/20 group-hover:border-cyan-500/60 transition-all duration-300 h-full">

                <div className="flex justify-between gap-3">

                  {/* Info (nom, date, barre progression) */}
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-100 font-bold text-sm truncate group-hover:text-cyan-200 transition-colors">
                      {person.first_name} {person.last_name}
                    </p>

                    <p className="text-cyan-400 text-xs mt-2 flex items-center gap-1">
                      <span>📅</span>
                      {person.birthdayDate.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>

                    {/* Barre de progression */}
                    {person.daysUntilBirthday > 0 && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/10">
                        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                            style={{
                              width: `${Math.max(10, 100 - person.daysUntilBirthday * 3)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BADGES — modifié en flex-col + h-full */}
                  <div className="flex justify-between items-center gap-2">

                    {/* Badge âge */}
                    <div>
                      <div className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 rounded-lg p-2 border border-purple-500/50 group-hover:border-purple-400/80 transition-colors text-center w-full ">
                        <p className="text-xs text-purple-400 font-medium">Âge</p>
                        <p className="text-sm font-bold text-purple-200">{person.age}</p>
                      </div>
                    </div>

                    {/* Badge jours */}
                    {person.daysUntilBirthday === 0 ? (
                      <div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-500/20 rounded-lg blur animate-pulse" />
                          <div className="relative bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 rounded-lg p-2 border border-yellow-500/40 text-center">
                            <p className="text-xs text-yellow-400 font-medium">Aujourd&apos;hui</p>
                            <p className="text-sm font-bold text-yellow-200">🎉</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="bg-gradient-to-br from-cyan-600/40 to-cyan-700/40 rounded-lg p-2 border border-cyan-500/50 group-hover:border-cyan-400/80 transition-colors text-center">
                          <p className="text-xs text-cyan-400 font-medium">Jours</p>
                          <p className="text-sm font-bold text-cyan-200">{person.daysUntilBirthday}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

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
            {sortConfig.key === key
              ? sortConfig.direction === "asc"
                ? "▲"
                : "▼"
              : ""}
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