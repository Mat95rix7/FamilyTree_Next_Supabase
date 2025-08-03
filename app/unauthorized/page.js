'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UnAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen dark-bg-animated">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-9xl font-extrabold text-gray-800 mb-4">401</h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-2xl text-white"
        >
          Oups ! Vous n&apos;êtes pas autorisé à accéder à cette page.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-6"
      >
        <Link
          href="/"
          className="px-6 py-3 !text-gray-800 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg shadow-lg hover:bg-amber-500 transition"
        >
          Retour à l&apos;accueil
        </Link>
      </motion.div>
    </div>
  );
}
