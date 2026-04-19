import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminstyles/ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '', role: 'user' });
    const [isEditing, setIsEditing] = useState(false);
    
    // Ambil data user yang sedang login dari localStorage (Sesuaikan dengan cara app-mu menyimpan data auth)
    const currentUser = JSON.parse(localStorage.getItem('user')); 
    const isSuperAdmin = currentUser?.role === 'superadmin';

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users?search=${search}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/users/${formData.id}`, formData);
                alert("User berhasil diupdate");
            } else {
                await axios.post('http://localhost:5000/api/users', formData);
                alert("User berhasil ditambahkan");
            }
            setFormData({ id: null, name: '', email: '', password: '', role: 'user' });
            setIsEditing(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Terjadi kesalahan");
        }
    };

    const editUser = (user) => {
        setFormData({ id: user.id, name: user.name, email: user.email, password: '', role: user.role });
        setIsEditing(true);
    };

    const deleteUser = async (id) => {
        if(window.confirm("Yakin ingin menghapus user ini?")) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user", error);
            }
        }
    };

    return (
        <div className="admin-content">
            <h2>Kelola User</h2>
            
            {/* SEARCH */}
            <input 
                type="text" 
                placeholder="Cari nama user..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ marginBottom: '20px', padding: '8px', width: '300px' }}
            />

            {/* FORM CREATE / UPDATE */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
                <h3>{isEditing ? 'Edit User' : 'Tambah User'}</h3>
                <input type="text" name="name" placeholder="Nama" value={formData.name} onChange={handleInputChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                <input type="password" name="password" placeholder={isEditing ? "Kosongkan jika tidak ubah password" : "Password"} value={formData.password} onChange={handleInputChange} required={!isEditing} />
                
                <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange}
                    disabled={isEditing && !isSuperAdmin} // Disable jika edit dan bukan superadmin
                    title={isEditing && !isSuperAdmin ? "Hanya superadmin yang bisa ubah role" : ""}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {isSuperAdmin && <option value="superadmin">Superadmin</option>}
                </select>

                <button type="submit">{isEditing ? 'Update' : 'Simpan'}</button>
                {isEditing && <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: null, name: '', email: '', password: '', role: 'user' }); }}>Batal</button>}
            </form>

            {/* TABLE READ */}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => editUser(user)}>Edit</button>
                                <button onClick={() => deleteUser(user.id)} style={{ backgroundColor: 'red', color: 'white' }}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;