import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/api';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiUserPlus } from 'react-icons/fi';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Loading from '../../../components/Loading/Loading';
import './Squads.css';

const Squads = () => {
  const [squads, setSquads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    batch: 'BATCH_1',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [squadsData, usersData] = await Promise.all([
        adminService.getAllSquads(),
        adminService.getUnassignedUsers(),
      ]);
      setSquads(squadsData.data);
      setUsers(usersData.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    try {
      await adminService.createSquad(formData);
      toast.success('Squad created successfully');
      setShowModal(false);
      setFormData({ name: '', batch: 'BATCH_1' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create squad');
    }
  };

  const handleDeleteSquad = async (squadId) => {
    if (!window.confirm('Are you sure you want to delete this squad?')) return;
    try {
      await adminService.deleteSquad(squadId);
      toast.success('Squad deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete squad');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading squads..." />;
  }

  return (
    <div className="squads-page">
      <div className="dashboard-container">
        <div className="page-header">
          <div>
            <h1>Squad Management</h1>
            <p>Create and manage squads and their members</p>
          </div>
          <Button icon={<FiPlus />} onClick={() => setShowModal(true)}>
            Create Squad
          </Button>
        </div>

        <div className="squads-grid">
          {squads.map((squad) => (
            <Card key={squad._id} className="squad-management-card">
              <div className="squad-card-header">
                <div>
                  <h3>{squad.name}</h3>
                  <span className={`batch-tag ${squad.batch.toLowerCase()}`}>
                    {squad.batch}
                  </span>
                </div>
                <div className="squad-actions">
                  <Button
                    size="small"
                    variant="outline"
                    icon={<FiEdit />}
                    onClick={() => {
                      setSelectedSquad(squad);
                      setModalType('edit');
                      setFormData({ name: squad.name, batch: squad.batch });
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    icon={<FiTrash2 />}
                    onClick={() => handleDeleteSquad(squad._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="squad-info">
                <div className="info-item">
                  <FiUsers />
                  <span>Members: {squad.memberCount || 0} / {squad.maxMembers}</span>
                </div>
              </div>

              <div className="members-list">
                {squad.members && squad.members.length > 0 ? (
                  squad.members.map((member) => (
                    <div key={member._id} className="member-item">
                      <div className="member-info">
                        <strong>{member.name}</strong>
                        <span>{member.email}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-members">No members assigned</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{modalType === 'create' ? 'Create Squad' : 'Edit Squad'}</h2>
              <form onSubmit={handleCreateSquad}>
                <Input
                  label="Squad Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter squad name"
                  required
                />

                <div className="input-group">
                  <label className="input-label">Batch Assignment *</label>
                  <select
                    className="input-field"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    required
                  >
                    <option value="BATCH_1">BATCH 1</option>
                    <option value="BATCH_2">BATCH 2</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {modalType === 'create' ? 'Create Squad' : 'Update Squad'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squads;
