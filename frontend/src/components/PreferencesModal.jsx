import React, { useEffect, useState } from 'react';
import { FiSave, FiSettings, FiX } from 'react-icons/fi';
import { authAPI } from '../utils/auth';

const defaultPreferences = {
  dashboard_layout: 'default',
  email_frequency: 'daily',
  language: 'en',
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    matches: true,
    reports: true,
    marketing: false,
  },
};

function PreferencesModal({ isOpen, onClose }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const loadPreferences = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await authAPI.getPreferences();
        setPreferences({ ...defaultPreferences, ...data.preferences });
      } catch (err) {
        setError(err.message || 'Failed to fetch preferences');
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, [isOpen]);

  if (!isOpen) return null;

  const updateNotification = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.updatePreferences(preferences);
      setSuccess('Preferences updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preferences-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FiSettings /> Preferences</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        {loading ? (
          <p>Loading preferences...</p>
        ) : (
          <form className="preferences-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            <div className="preferences-sections">
              <section className="preference-section">
                <h3>Appearance</h3>
                <label>
                  Theme
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </label>
                <label>
                  Dashboard layout
                  <select
                    value={preferences.dashboard_layout}
                    onChange={(e) => setPreferences({ ...preferences, dashboard_layout: e.target.value })}
                  >
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                  </select>
                </label>
              </section>
              <section className="preference-section">
                <h3>Notifications</h3>
                <div className="preference-items">
                  {Object.entries(preferences.notifications).map(([key, enabled]) => (
                    <label key={key} className="preference-item">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => updateNotification(key, e.target.checked)}
                      />
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : <><FiSave /> Save Preferences</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PreferencesModal;
