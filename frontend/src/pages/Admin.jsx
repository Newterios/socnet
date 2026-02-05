import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../services/api'
import './Admin.css'

const statuses = ['pending', 'reviewed', 'resolved']

export default function Admin() {
    const [status, setStatus] = useState('pending')
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionKey, setActionKey] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        loadReports(status)
    }, [status])

    const loadReports = async (nextStatus) => {
        setLoading(true)
        setError('')
        try {
            const res = await adminAPI.getReports(nextStatus)
            setReports(res.data || [])
        } catch (err) {
            setError(readError(err) || 'Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    const handleReview = async (reportId, nextStatus) => {
        const key = `${reportId}:${nextStatus}`
        setActionKey(key)
        setError('')
        try {
            await adminAPI.reviewReport(reportId, nextStatus)
            await loadReports(status)
        } catch (err) {
            setError(readError(err) || 'Failed to review report')
        } finally {
            setActionKey('')
        }
    }

    const handleDelete = async (report) => {
        const key = `${report.id}:delete`
        setActionKey(key)
        setError('')
        try {
            await adminAPI.deleteContent(report.target_type, report.target_id)
            await loadReports(status)
        } catch (err) {
            setError(readError(err) || 'Failed to delete content')
        } finally {
            setActionKey('')
        }
    }

    const formatDate = (value) => new Date(value).toLocaleString()

    return (
        <div className="page-container admin-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="admin-header">
                    <h1 className="page-title">Admin</h1>
                    <div className="admin-filters">
                        {statuses.map(item => (
                            <button
                                key={item}
                                className={`btn ${status === item ? 'btn-primary' : 'btn-secondary'} admin-filter-btn`}
                                onClick={() => setStatus(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="admin-error card">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="admin-loading">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card">
                                <div className="skeleton" style={{ height: 120 }}></div>
                            </div>
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="card admin-empty">
                        No reports with status "{status}"
                    </div>
                ) : (
                    <div className="admin-reports">
                        {reports.map((report) => (
                            <motion.div
                                key={report.id}
                                className="card admin-report"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="admin-report-head">
                                    <div>
                                        <h3>Report #{report.id}</h3>
                                        <p>
                                            {report.target_type} #{report.target_id}
                                        </p>
                                    </div>
                                    <span className="badge badge-primary">{report.status}</span>
                                </div>

                                <p className="admin-report-reason">{report.reason}</p>

                                <div className="admin-report-meta">
                                    <span>
                                        Reporter: {report.reporter?.full_name || report.reporter?.username || `User #${report.reporter_id}`}
                                    </span>
                                    <span>{formatDate(report.created_at)}</span>
                                </div>

                                <div className="admin-report-actions">
                                    {report.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleReview(report.id, 'reviewed')}
                                                disabled={actionKey !== '' && actionKey !== `${report.id}:reviewed`}
                                            >
                                                {actionKey === `${report.id}:reviewed` ? 'Saving...' : 'Mark reviewed'}
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleReview(report.id, 'resolved')}
                                                disabled={actionKey !== '' && actionKey !== `${report.id}:resolved`}
                                            >
                                                {actionKey === `${report.id}:resolved` ? 'Saving...' : 'Resolve'}
                                            </button>
                                        </>
                                    )}
                                    {(report.target_type === 'post' || report.target_type === 'comment') && (
                                        <button
                                            className="btn btn-secondary admin-delete-btn"
                                            onClick={() => handleDelete(report)}
                                            disabled={actionKey !== '' && actionKey !== `${report.id}:delete`}
                                        >
                                            {actionKey === `${report.id}:delete` ? 'Deleting...' : 'Delete content'}
                                        </button>
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

function readError(err) {
    const data = err?.response?.data
    if (typeof data === 'string') {
        return data
    }
    return data?.error || ''
}
