import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { groupsAPI } from '../services/api'
import './Groups.css'

export default function Groups() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newGroup, setNewGroup] = useState({ title: '', description: '' })
    const [expandedGroups, setExpandedGroups] = useState({})
    const [groupPosts, setGroupPosts] = useState({})
    const [loadingPosts, setLoadingPosts] = useState({})
    const [postDrafts, setPostDrafts] = useState({})
    const [submittingPosts, setSubmittingPosts] = useState({})

    useEffect(() => {
        loadGroups()
    }, [])

    const loadGroups = async () => {
        try {
            const res = await groupsAPI.getList()
            setGroups(res.data || [])
        } catch (err) {
            console.error('Failed to load groups')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        if (!newGroup.title.trim()) return

        try {
            const res = await groupsAPI.create(newGroup)
            setGroups([res.data, ...groups])
            setNewGroup({ title: '', description: '' })
            setShowCreate(false)
        } catch (err) {
            console.error('Failed to create group')
        }
    }

    const handleJoin = async (groupId) => {
        try {
            await groupsAPI.join(groupId)
            setGroups(groups.map(g =>
                g.id === groupId ? { ...g, is_member: true, member_count: (g.member_count || 0) + 1 } : g
            ))
        } catch (err) {
            console.error('Failed to join group')
        }
    }

    const handleLeave = async (groupId) => {
        try {
            await groupsAPI.leave(groupId)
            setGroups(groups.map(g =>
                g.id === groupId ? { ...g, is_member: false, member_count: Math.max(0, (g.member_count || 1) - 1) } : g
            ))
            setExpandedGroups(prev => ({ ...prev, [groupId]: false }))
        } catch (err) {
            console.error('Failed to leave group')
        }
    }

    const toggleGroupPosts = async (groupId) => {
        const isOpen = !!expandedGroups[groupId]
        setExpandedGroups(prev => ({ ...prev, [groupId]: !isOpen }))

        if (!isOpen && !groupPosts[groupId]) {
            setLoadingPosts(prev => ({ ...prev, [groupId]: true }))
            try {
                const res = await groupsAPI.getPosts(groupId)
                setGroupPosts(prev => ({ ...prev, [groupId]: res.data || [] }))
            } catch (err) {
                console.error('Failed to load group posts')
                setGroupPosts(prev => ({ ...prev, [groupId]: [] }))
            } finally {
                setLoadingPosts(prev => ({ ...prev, [groupId]: false }))
            }
        }
    }

    const handleCreateGroupPost = async (e, groupId) => {
        e.preventDefault()
        const content = (postDrafts[groupId] || '').trim()
        if (!content) return

        setSubmittingPosts(prev => ({ ...prev, [groupId]: true }))
        try {
            const res = await groupsAPI.createPost(groupId, { content })
            setGroupPosts(prev => ({
                ...prev,
                [groupId]: [res.data, ...(prev[groupId] || [])]
            }))
            setPostDrafts(prev => ({ ...prev, [groupId]: '' }))
            setExpandedGroups(prev => ({ ...prev, [groupId]: true }))
        } catch (err) {
            console.error('Failed to create group post')
        } finally {
            setSubmittingPosts(prev => ({ ...prev, [groupId]: false }))
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleString()
    }

    return (
        <div className="page-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="groups-header">
                    <h1 className="page-title">Groups</h1>
                    <motion.button
                        className="btn btn-primary"
                        onClick={() => setShowCreate(!showCreate)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Group
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showCreate && (
                        <motion.div
                            className="create-group card"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <h3>Create New Group</h3>
                            <form onSubmit={handleCreateGroup}>
                                <div className="form-group">
                                    <label>Group Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter group name"
                                        value={newGroup.title}
                                        onChange={e => setNewGroup({ ...newGroup, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="What is this group about?"
                                        rows={3}
                                        value={newGroup.description}
                                        onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="groups-loading">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="group-skeleton card">
                                <div className="skeleton" style={{ height: 100 }}></div>
                            </div>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="groups-empty card">
                        <div className="groups-empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                        </div>
                        <h3>No groups yet</h3>
                        <p>Create or join a group to connect with others</p>
                    </div>
                ) : (
                    <div className="groups-grid">
                        {groups.map((group, index) => (
                            <motion.div
                                key={group.id}
                                className="group-card card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="group-cover">
                                    <div className="group-cover-gradient"></div>
                                </div>
                                <div className="group-content">
                                    <h3 className="group-title">{group.title}</h3>
                                    <p className="group-description">{group.description || 'No description'}</p>
                                    <div className="group-meta">
                                        <span className="group-members">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                            {group.member_count || 0} members
                                        </span>
                                    </div>
                                    {group.is_member ? (
                                        <button
                                            className="btn btn-secondary group-btn"
                                            onClick={() => handleLeave(group.id)}
                                        >
                                            Leave Group
                                        </button>
                                    ) : (
                                        <motion.button
                                            className="btn btn-primary group-btn"
                                            onClick={() => handleJoin(group.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Join Group
                                        </motion.button>
                                    )}

                                    {group.is_member && (
                                        <>
                                            <button
                                                className="btn btn-ghost group-posts-toggle"
                                                onClick={() => toggleGroupPosts(group.id)}
                                            >
                                                {expandedGroups[group.id] ? 'Hide posts' : 'Group posts'}
                                            </button>

                                            <AnimatePresence>
                                                {expandedGroups[group.id] && (
                                                    <motion.div
                                                        className="group-posts-section"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <form
                                                            className="group-post-form"
                                                            onSubmit={(e) => handleCreateGroupPost(e, group.id)}
                                                        >
                                                            <textarea
                                                                className="input-field"
                                                                placeholder="Write a post for this group..."
                                                                rows={2}
                                                                value={postDrafts[group.id] || ''}
                                                                onChange={e => setPostDrafts(prev => ({ ...prev, [group.id]: e.target.value }))}
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="btn btn-primary"
                                                                disabled={submittingPosts[group.id] || !(postDrafts[group.id] || '').trim()}
                                                            >
                                                                {submittingPosts[group.id] ? 'Posting...' : 'Post'}
                                                            </button>
                                                        </form>

                                                        <div className="group-posts-list">
                                                            {loadingPosts[group.id] ? (
                                                                <div className="group-posts-empty">Loading posts...</div>
                                                            ) : (groupPosts[group.id] || []).length === 0 ? (
                                                                <div className="group-posts-empty">No posts yet</div>
                                                            ) : (
                                                                (groupPosts[group.id] || []).map(post => (
                                                                    <div key={post.id} className="group-post-item">
                                                                        <div className="group-post-head">
                                                                            <span>{post.author?.full_name || post.author?.username || 'User'}</span>
                                                                            <span>{formatDate(post.created_at)}</span>
                                                                        </div>
                                                                        <p>{post.content}</p>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
