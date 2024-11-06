import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/accountmanager.css';

function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: ''
  });
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('https://67040f16ab8a8f892732c8b7.mockapi.io/account');
        setAccounts(response.data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchAccounts();
  }, []);

  const handleCreate = () => {
    setFormData({ username: '', email: '', role: '' });
    setIsUpdate(false);
    setShowForm(true);
  };

  const handleUpdate = (id) => {
    const account = accounts.find(a => a.id === id);
    setFormData({ ...account });
    setIsUpdate(true);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUpdate) {
      await axios.put(`https://api.example.com/accounts/${formData.id}`, formData);
    } else {
      await axios.post('https://api.example.com/accounts', formData);
    }
    setShowForm(false);
    // Refresh accounts list
    const response = await axios.get('https://api.example.com/accounts');
    setAccounts(response.data);
  };

  const handleDelete = async (id) => {
    await axios.delete(`https://api.example.com/accounts/${id}`);
    // Refresh accounts list
    const response = await axios.get('https://api.example.com/accounts');
    setAccounts(response.data);
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const paginatedData = accounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  return (
    <div>
      <h1 className='section-title'>Account Management</h1>
      <button className="new-route-button" onClick={handleCreate}>Create Account</button>
      <table className="transport-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map(account => (
            <tr key={account.id}>
              <td>{account.id}</td>
              <td>{account.username}</td>
              <td>{account.email}</td>
              <td>{account.role}</td>
              <td>
                <button className="transport-button" onClick={() => handleUpdate(account.id)}>Update</button>
                <button className="transport-button" onClick={() => handleDelete(account.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="arrow-button" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&laquo;</button>
        <button className="arrow-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lsaquo;</button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button className="arrow-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&rsaquo;</button>
        <button className="arrow-button" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
        <select
          value={currentPage}
          onChange={(e) => handlePageChange(Number(e.target.value))}
          className="page-select"
        >
          {Array.from({ length: totalPages }, (_, index) => (
            <option key={index} value={index + 1}>
              Page {index + 1}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowForm(false)}>&times;</span>
            <h2>{isUpdate ? 'Update Account' : 'Create Account'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="go-button">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountManagement;