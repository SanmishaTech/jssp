import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Edittestcard.css'; // Assuming you'll create a CSS file for styling

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'view' | 'edited' | 'other';
}

// Backend API response structure
interface BackendActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: number;
  causer_type: string;
  causer_id: number;
  properties: any;
  created_at: string;
  updated_at: string;
  causer?: {
    name: string;
    email: string;
  };
}

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Transform backend data to frontend format
  const transformActivityLog = (backendData: BackendActivityLog[]): ActivityLogEntry[] => {
    return backendData.map(item => {
      const actionType = determineActionType(item.description, item.log_name);
      return {
        id: item.id.toString(),
        timestamp: item.created_at,
        user: item.causer?.name || 'Unknown User',
        action: item.description || 'Activity performed',
        details: `${item.subject_type || 'Item'} (ID: ${item.subject_id || 'N/A'})`,
        type: actionType
      };
    });
  };

  // Determine activity type based on description and log name
  const determineActionType = (description: string, logName: string): 'create' | 'update' | 'delete' | 'view' | 'edited' | 'other' => {
    const desc = description.toLowerCase();
    const log = logName.toLowerCase();
    
    if (desc.includes('created') || desc.includes('create') || log.includes('created')) return 'create';
    if (desc.includes('edited') || desc.includes('edit') || log.includes('edited') || log.includes('edit')) return 'edited';
    if (desc.includes('updated') || desc.includes('update') || desc.includes('modified') || log.includes('updated')) return 'update';
    if (desc.includes('deleted') || desc.includes('delete') || desc.includes('removed') || log.includes('deleted')) return 'delete';
    if (desc.includes('viewed') || desc.includes('view') || desc.includes('accessed') || log.includes('viewed')) return 'view';
    return 'other';
  };

  // Fetch activity log from backend API
  useEffect(() => {
    const fetchActivityLog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/activity-logs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.data) {
          const transformedData = transformActivityLog(response.data.data);
          setActivities(transformedData);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activity log:', error);
        setError('Failed to load activity log. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLog();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return '➕';
      case 'edited': return '✏️';
      case 'update': return '🔄';
      case 'delete': return '🗑️';
      case 'view': return '👁️';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create': return '#28a745';
      case 'edited': return '#ff6b35';
      case 'update': return '#ffc107';
      case 'delete': return '#dc3545';
      case 'view': return '#007bff';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="activity-log-container">
        <div className="loading-spinner">Loading activity log...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-log-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <div className="activity-log-header">
        <h1>Activity Log</h1>
        <div className="activity-log-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Activities</option>
              <option value="create">Created</option>
              <option value="edited">Edited</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
              <option value="view">Viewed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="activity-log-content">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <p>No activities found matching your criteria.</p>
          </div>
        ) : (
          <div className="activity-timeline">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon" style={{ color: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-timestamp">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                  <div className="activity-details">
                    <p className="activity-user">by {activity.user}</p>
                    <p className="activity-description">{activity.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="activity-log-footer">
        <p className="activity-count">
          Showing {filteredActivities.length} of {activities.length} activities
        </p>
      </div>
    </div>
  );
};

export default ActivityLog;
