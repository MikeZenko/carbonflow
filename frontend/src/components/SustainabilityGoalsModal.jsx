import React, { useEffect, useState } from 'react';
import { FaLeaf } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { authAPI } from '../utils/auth';

const defaultGoals = {
  carbon_reduction_target: 0,
  target_date: '',
  current_progress: 0,
  milestones: [],
  tracking_method: 'manual',
};

function SustainabilityGoalsModal({ isOpen, onClose }) {
  const [goals, setGoals] = useState(defaultGoals);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const loadGoals = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await authAPI.getSustainabilityGoals();
        setGoals({ ...defaultGoals, ...data.goals });
      } catch (err) {
        setError(err.message || 'Failed to fetch goals');
      } finally {
        setLoading(false);
      }
    };
    loadGoals();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.updateSustainabilityGoals(goals);
      setSuccess('Sustainability goals updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update sustainability goals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sustainability-goals-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaLeaf /> Sustainability Goals</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        {loading ? (
          <p>Loading goals...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            <label>
              Carbon reduction target (tonnes/year)
              <input
                type="number"
                min="0"
                value={goals.carbon_reduction_target}
                onChange={(e) => setGoals({ ...goals, carbon_reduction_target: Number(e.target.value) })}
              />
            </label>
            <label>
              Target date
              <input
                type="date"
                value={goals.target_date}
                onChange={(e) => setGoals({ ...goals, target_date: e.target.value })}
              />
            </label>
            <label>
              Current progress (%)
              <input
                type="number"
                min="0"
                max="100"
                value={goals.current_progress}
                onChange={(e) => setGoals({ ...goals, current_progress: Number(e.target.value) })}
              />
            </label>
            <label>
              Tracking method
              <select
                value={goals.tracking_method}
                onChange={(e) => setGoals({ ...goals, tracking_method: e.target.value })}
              >
                <option value="manual">Manual</option>
                <option value="automated">Automated</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SustainabilityGoalsModal;
