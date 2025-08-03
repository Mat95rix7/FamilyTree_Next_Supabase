"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, getPhotoUrl } from "../services/FetchAPI";
import Image from "next/image";

export default function PeresList() {
  const [peres, setPeres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState(false);

  useEffect(() => {
    apiFetch("/familles")
      .then((res) => res.json())
      .then((data) => {
        setPeres(data);
        setLoading(false);
      });
  }, []);

  const filteredfamilles = peres.filter((pere) =>
    `${pere.first_name} ${pere.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  function groupByLastName(peres) {
    return peres.reduce((groups, pere) => {
      const lastName = pere.last_name || "Inconnu";
      if (!groups[lastName]) {
        groups[lastName] = [];
      }
      groups[lastName].push(pere);
      return groups;
    }, {});
  }

  const groupedFamilles = groupByLastName(filteredfamilles);
  const lastNames = Object.keys(groupedFamilles).sort();

  if (loading)
    return (
      <div className="text-center text-cyan-400 mt-10 text-xl">Chargement...</div>
    );

  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold text-cyan-300 mb-8 text-center">
        Liste des Familles
      </h1>
      <div className="mb-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 shadow-lg flex flex-col sm:flex-row sm:items-center gap-4 mx-5 md:mx-0">
        <div className="flex flex-1 items-center gap-4">
          <label
            htmlFor="search"
            className="text-cyan-100 font-medium whitespace-nowrap"
          >
            Rechercher :
          </label>
          <input
            id="search"
            type="text"
            placeholder="Nom, prénom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
          />
        </div>
        <button
          onClick={() => setGroupBy(!groupBy)}
          className="w-full sm:w-auto px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition"
        >
          {groupBy ? "Afficher sans tri" : "Trier par nom de famille"}
        </button>
      </div>




      {filteredfamilles.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 rounded p-4 text-center">
          Aucune Famille trouvée.
        </div>
      ) : groupBy ? (
        lastNames.map((lastName) => (
          <div key={lastName} className="mb-10 mx-5 md:mx-0">
            <h2 className="text-2xl font-bold text-cyan-200 mb-4">{lastName}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 ">
              {groupedFamilles[lastName].map((pere) => (
                <div
                  key={pere.id}
                  className="card bg-gray-900 text-white shadow-lg rounded-2xl h-full flex flex-col items-center p-6 "
                >
                  <Link
                    href={`/familles/${pere.id}`}
                    className="flex flex-col items-center text-white hover:text-cyan-300 transition"
                  >
                    <Image
                      src={getPhotoUrl(pere.photo) || ""}
                      alt="Photo"
                      width={90}
                      height={90}
                      style={{ width: 90, height: 90, objectFit: "cover" }}
                      className="rounded-full border-4 border-cyan-400 mb-3 shadow-md"
                    />
                    <h4 className="text-xl font-bold mb-1">
                      {pere.last_name?.charAt(0)}. {pere.first_name}
                    </h4>
                    <span className="inline-block bg-cyan-400 text-gray-900 font-semibold px-3 py-1 rounded-full mt-1">
                      Voir la famille
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mx-5 md:mx-0">
          {filteredfamilles.map((pere) => (
            <div
              key={pere.id}
              className="card bg-gray-900 text-white shadow-lg rounded-2xl h-full flex flex-col items-center p-6"
            >
              <Link
                href={`/familles/${pere.id}`}
                className="flex flex-col items-center text-white hover:text-cyan-300 transition"
              >
                <Image
                  src={getPhotoUrl(pere.photo) || ""}
                  alt="Photo"
                  width={90}
                  height={90}
                  style={{ width: 90, height: 90, objectFit: "cover" }}
                  className="object-cover rounded-full border-4 border-cyan-400 mb-3 shadow-md"
                />
                <h4 className="text-xl font-bold mb-1">
                  {pere.last_name?.charAt(0)}. {pere.first_name}
                </h4>
                <span className="inline-block bg-cyan-400 text-gray-900 font-semibold px-3 py-1 rounded-full mt-1">
                  Voir la famille
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
