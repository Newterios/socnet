import { useState } from 'react'
import { motion } from 'framer-motion'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

export default function Settings() {
    const { user, updateUser } = useAuth()
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        avatar_url: user?.avatar_url || ''
    })
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setSaved(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await usersAPI.updateProfile(user.id, formData)
            updateUser(formData)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">Settings</h1>

                <div className="settings-section card">
                    <h2 className="settings-section-title">Profile</h2>
                    <p className="settings-section-desc">Update your profile information</p>

                    <form className="settings-form" onSubmit={handleSubmit}>
                        <div className="settings-avatar-section">
                            <div className="avatar avatar-lg">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="" />
                                ) : (
                                    user?.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="avatar-upload">
                                <label>Avatar URL</label>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    className="input-field"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={formData.avatar_url}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                className="input-field"
                                placeholder="Your full name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                className="input-field"
                                placeholder="Tell us about yourself"
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={user?.email || ''}
                                disabled
                            />
                            <span className="form-hint">Email cannot be changed</span>
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="input-field"
                                value={user?.username || ''}
                                disabled
                            />
                            <span className="form-hint">Username cannot be changed</span>
                        </div>

                        <div className="settings-actions">
                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <span className="btn-loader"></span>
                                ) : saved ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Saved!
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>

                <div className="settings-section card">
                    <h2 className="settings-section-title">Account</h2>
                    <p className="settings-section-desc">Manage your account settings</p>

                    <div className="settings-option">
                        <div className="settings-option-info">
                            <h4>Member since</h4>
                            <p>{new Date(user?.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="settings-option danger">
                        <div className="settings-option-info">
                            <h4>Delete Account</h4>
                            <p>Permanently delete your account and all data</p>
                        </div>
                        <button className="btn btn-ghost danger-btn">Delete</button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
