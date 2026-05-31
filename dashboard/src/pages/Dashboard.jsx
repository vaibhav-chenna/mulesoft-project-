import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiCheckCircle, FiClock, FiMessageSquare, FiRefreshCw, FiSmile } from 'react-icons/fi';
import { API_BASE_URL, authHeaders } from '../config';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#7c3aed'];

const fallback = {
  stats: { totalQueries: 0, resolvedQueries: 0, avgResolutionTime: 0, satisfactionRate: 0 },
  trends: [],
  intents: [],
  recent: [],
};

export const Dashboard = () => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [statsRes, trendsRes, intentsRes, recentRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/stats`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/analytics/trends`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/analytics/intents`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/queries/recent?limit=10`, { headers: authHeaders }),
      ]);

      setData({
        stats: statsRes.data,
        trends: trendsRes.data,
        intents: intentsRes.data,
        recent: recentRes.data,
      });
    } catch (err) {
      setError('Start the local API with npm run api, then refresh this dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="state-panel">Loading dashboard...</div>;
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Live operations</p>
          <h1>Customer Support Dashboard</h1>
          <p>Analytics, query volume, intent distribution, and recent chatbot conversations.</p>
        </div>
        <button className="icon-button" onClick={fetchDashboardData} title="Refresh dashboard">
          <FiRefreshCw aria-hidden="true" />
        </button>
      </header>

      {error && <div className="notice">{error}</div>}

      <div className="metric-grid">
        <MetricCard icon={FiMessageSquare} label="Total queries" value={data.stats.totalQueries} />
        <MetricCard icon={FiCheckCircle} label="Resolved" value={data.stats.resolvedQueries} />
        <MetricCard icon={FiClock} label="Avg resolution" value={`${data.stats.avgResolutionTime}m`} />
        <MetricCard icon={FiSmile} label="Satisfaction" value={`${data.stats.satisfactionRate}%`} />
      </div>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Query Trends</h2>
            <span>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="queries" stroke="#2563eb" strokeWidth={3} type="monotone" />
              <Line dataKey="resolved" stroke="#10b981" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Intent Mix</h2>
            <span>Current data</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.intents} dataKey="value" nameKey="name" outerRadius={92} label>
                {data.intents.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Recent Queries</h2>
          <span>{data.recent.length} latest</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Customer</th>
                <th>Intent</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((query) => (
                <tr key={query.id || `${query.customerId}-${query.timestamp}`}>
                  <td>{query.query}</td>
                  <td>{query.customerId}</td>
                  <td><span className="tag">{query.intent}</span></td>
                  <td><span className="tag success">{query.status}</span></td>
                  <td>{new Date(query.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="metric-card">
    <div className="metric-icon"><Icon aria-hidden="true" /></div>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default Dashboard;
