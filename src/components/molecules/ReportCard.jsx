import React from 'react';
import StatusBadge from '../atoms/StatusBadge';
import CategoryBadge from '../atoms/CategoryBadge';
import UpvoteButton from '../atoms/UpvoteButton';

export default function ReportCard({ report }) {
  return (
    <div className="report-card">
      <div className="card-top-tags">
        <StatusBadge status={report.status} />
        <CategoryBadge category={report.category} />
      </div>

      <p className="report-desc">{report.description}</p>

      <div className="report-media-box">
        {report.image ? (
          <img src={report.image} alt={report.category} className="report-img" />
        ) : (
          <div className="placeholder-image">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="report-meta">
        <div className="meta-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{report.location}</span>
        </div>

        <div className="meta-row date-author">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{report.date}</span>
          <span className="dot">•</span>
          <span>By {report.author}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="action-buttons">
          <UpvoteButton initialCount={report.upvotes} />
          <button className="comments-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{report.commentsCount}</span>
          </button>
        </div>

        {report.assignedTo && (
          <div className="assigned-tag">
            Assigned to: <strong>{report.assignedTo}</strong>
          </div>
        )}
      </div>
    </div>
  );
}