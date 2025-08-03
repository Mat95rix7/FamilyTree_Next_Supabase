"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PersonForm from "../../../components/PersonForm";
import { apiFetch } from "../../../services/FetchAPI";

export default function EditPersonne() {
  const { id } = useParams();
  const [personData, setPersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      apiFetch(`/personnes/${id}`)
        .then(res => res.json())
        .then(data => {
          setPersonData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Erreur lors du chargement:", error);
          setError("Erreur lors du chargement de la personne");
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-cyan-300">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <PersonForm 
      mode="edit"
      initialData={personData}
    />
  );
}