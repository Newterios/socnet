import { useState } from 'react'
import { motion } from 'framer-motion'
import { postsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './CreatePost.css'

export default function CreatePost({ onPostCreated }) {
    const { user } = useAuth()
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim() || loading) return

        setLoading(true)
        try {
            const res = await postsAPI.create({ content, media_url: '' })
            onPostCreated?.(res.data)
            setContent('')
            setFocused(false)
        } catch (err) {
            console.error('Failed to create post')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            className={`create-post card ${focused ? 'focused' : ''}`}
            layout
        >
            <div className="create-post-header">
                <div className="avatar">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" />
                    ) : (
                        user?.username?.charAt(0).toUpperCase()
                    )}
                </div>
                <form className="create-post-form" onSubmit={handleSubmit}>
                    <textarea
                        className="create-post-input"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onFocus={() => setFocused(true)}
                        rows={focused ? 3 : 1}
                    />

                    <motion.div
                        className="create-post-actions"
                        initial={false}
                        animate={{
                            height: focused ? 'auto' : 0,
                            opacity: focused ? 1 : 0
                        }}
                    >
                        <div className="create-post-tools">
                            <button type="button" className="btn btn-icon btn-ghost" title="Add image">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </button>
                            <button type="button" className="btn btn-icon btn-ghost" title="Add emoji">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                </svg>
                            </button>
                        </div>
                        <motion.button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!content.trim() || loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span className="btn-loader"></span>
                            ) : (
                                'Post'
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </div>
        </motion.div>
    )
}
