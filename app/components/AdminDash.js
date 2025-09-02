'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Search, 
  Edit3, 
  Trash2, 
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp,
  Home
} from 'lucide-react';
import { apiFetch } from '../services/FetchAPI';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [familles, setFamilles] = useState([]);

  // Formulaire pour créer/modifier un utilisateur
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });

  useEffect(() => {
    apiFetch("/familles")
      .then((res) => res.json())
      .then((data) => {
        setFamilles(data);
        setLoading(false);
      });
  }, []);

  // Charger les statistiques
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs
  const loadUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await apiFetch(
        `/admin/users?page=${page}&limit=10&search=${search}`
      );
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      const response = await apiFetch(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadUsers(currentPage, searchTerm);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Mettre à jour un utilisateur
  const updateUser = async (userData) => {
    try {
      const response = await apiFetch(`/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        setEditingUser(null);
        loadUsers(currentPage, searchTerm);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Créer un utilisateur
  const createUser = async (userData) => {
    try {
      const response = await apiFetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setUserForm({ username: '', email: '', password: '', role: 'user', isActive: true });
        loadUsers(currentPage, searchTerm);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers(currentPage, searchTerm);
    }
  }, [activeTab, currentPage, searchTerm]);

  // Interface de modification d'utilisateur
  const EditUserModal = ({ user, onSave, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Modifier l&#39;utilisateur</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={user.username}
            onChange={e => setEditingUser({...user, username: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => setEditingUser({...user, email: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={user.role}
            onChange={(e) => setEditingUser({...user, role: e.target.value})}
            className="w-full p-2 border rounded-lg bg-gray-700"
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={user.isActive}
              onChange={(e) => setEditingUser({...user, isActive: e.target.checked})}
              className="mr-2"
            />
            Compte actif
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(user)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  // Interface de création d'utilisateur
  const CreateUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Créer un utilisateur</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={userForm.username}
            onChange={(e) => setUserForm({...userForm, username: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={userForm.password}
            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({...userForm, role: e.target.value})}
            className="w-full p-2 border rounded-lg"
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userForm.isActive}
              onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
              className="mr-2"
            />
            Compte actif
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => createUser(userForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark-bg-animated">
      {/* En-tête */}
      <header className=" shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Administration
            </h1>
            <div className="flex items-center space-x-4">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              <span className="text-xl text-gray-200 font-bold">Administrateur</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 my-3 sm:px-6 lg:px-8">
          <div className="flex space-x-8 justify-around">
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-1/2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-1/2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Utilisateurs
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'stats' && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Tableau de bord</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* Cartes de statistiques */}
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Personnes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.persons.totalPersons}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Home className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Familles</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {familles.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Âge moyen</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(stats.persons.averageAge || 0)} ans
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.users.reduce((sum, user) => sum + parseInt(user.count), 0)}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}

            {/* Graphiques */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par rôle</h3>
                  <div className="space-y-3">
                    {stats.users.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {user.role === 'admin' ? 'Administrateurs' : 'Utilisateurs'}
                        </span>
                        <span className="text-sm text-gray-600 font-medium">{user.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par genre</h3>
                  <div className="space-y-3">
                    {stats.genderDistribution.map((gender, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {gender.gender || 'Non spécifié'}
                        </span>
                        <span className="text-sm text-gray-600 font-medium">{gender.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel utilisateur
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table des utilisateurs */}
            <div className=" overflow-hidden sm:rounded-md">
              <ul className="">
                {users
                .sort((a, b) => (a.role === 'admin' ? -1 : 1))
                .map((user) => (
                  <li key={user.id} className="card !mx-5 !my-5 !bg-cyan-200  shadow-lg rounded-2xl h-full p-6">
                    <div className="flex items-center justify-between ">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          user.role === 'admin' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {user.role === 'admin' ? 
                            <Shield className="h-5 w-5 text-red-600" /> : 
                            <Users className="h-5 w-5 text-gray-600" />
                          }
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-xl font-bold text-gray-700">{user.username}</p>
                            {!user.isActive && (
                              <UserX className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-blue-800">{user.email}</p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Page {pagination.currentPage} sur {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={updateUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {showCreateModal && <CreateUserModal />}
    </div>
  );
};

export default AdminDashboard;