// components/PersonCard.tsx
import Image from "next/image";
import Link from "next/link";
import { getPhotoUrl } from "../services/FetchAPI";

export default function PersonCard({ personne }) {
  const birthYear = personne.birth_date
    ? new Date(personne.birth_date).getFullYear()
    : "Né(e) ?";

 const photoSrc = personne.photo ? getPhotoUrl(personne.photo) : "/default.png";

  return (
    <Link href={`/personnes/${personne.id}`} className="block">
      <div className="relative bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg hover:scale-[1.02] transition cursor-pointer flex items-center gap-4 mx-5 md:mx-0">
        <Image
          src={photoSrc}
          alt={personne.first_name || "Photo de profil"}
          width={56}
          height={56}
          className="rounded-full object-cover border-2 border-cyan-500"
        />
        <div className="flex-1">
          <h3 className="text-cyan-200 font-bold">
            {personne.first_name} {personne.last_name}
          </h3>
          <p>{personne.gender === 'Homme' ? "Fils de " : "Fille de "}<span className="text-gray-400">{personne.father ? personne.father.first_name : "Inconnu"}</span></p>
          <p className="text-sm text-gray-400">
            {personne.gender || "Genre ?"} – {personne.birth_place || "Lieu ?"}
          </p>
        </div>
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 font-bold text-md px-2 py-1 rounded-bl-lg rounded-tr-xl">
          {birthYear}
        </div>
      </div>
    </Link>
  );
}

