import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiDatabase, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { API_BASE_URL, authHeaders } from '../config';

const emptyCustomer = { id: '', name: '', email: '', phone: '', loyaltyTier: 'BRONZE', rewardPoints: 0 };

export const AdminPanel = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [newCustomer, setNewCustomer] = useState(emptyCustomer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      setLoading(true);
      const [customerRes, orderRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/customers`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/admin/orders`, { headers: authHeaders }),
      ]);
      setCustomers(customerRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      setError('Could not reach the local API on 8086. Run npm run api in the dashboard folder.');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (event) => {
    event.preventDefault();
    await axios.post(`${API_BASE_URL}/admin/customers`, newCustomer, { headers: authHeaders });
    setNewCustomer(emptyCustomer);
    fetchData();
  };

  const updateCustomer = async (id, patch) => {
    const next = customers.find((customer) => customer.id === id);
    await axios.put(`${API_BASE_URL}/admin/customers/${id}`, { ...next, ...patch }, { headers: authHeaders });
    fetchData();
  };

  const deleteCustomer = async (id) => {
    await axios.delete(`${API_BASE_URL}/admin/customers/${id}`, { headers: authHeaders });
    fetchData();
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Database controls</p>
          <h1>API Data Console</h1>
          <p>Create customers, inspect orders, and verify the data your API and chatbot use.</p>
        </div>
        <button className="icon-button" onClick={fetchData} title="Refresh data">
          <FiRefreshCw aria-hidden="true" />
        </button>
      </header>

      {error && <div className="notice">{error}</div>}

      <div className="tabs">
        <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
          Customers
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Orders
        </button>
      </div>

      {loading ? (
        <div className="state-panel">Loading database records...</div>
      ) : activeTab === 'customers' ? (
        <div className="split-grid">
          <form className="panel form-panel" onSubmit={createCustomer}>
            <div className="panel-header">
              <h2>Add Customer</h2>
              <FiPlus aria-hidden="true" />
            </div>
            {['id', 'name', 'email', 'phone'].map((field) => (
              <label key={field}>
                <span>{field}</span>
                <input
                  required={field !== 'phone'}
                  value={newCustomer[field]}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, [field]: event.target.value }))}
                />
              </label>
            ))}
            <label>
              <span>loyalty tier</span>
              <select
                value={newCustomer.loyaltyTier}
                onChange={(event) => setNewCustomer((prev) => ({ ...prev, loyaltyTier: event.target.value }))}
              >
                <option>BRONZE</option>
                <option>SILVER</option>
                <option>GOLD</option>
                <option>PLATINUM</option>
              </select>
            </label>
            <label>
              <span>reward points</span>
              <input
                type="number"
                value={newCustomer.rewardPoints}
                onChange={(event) => setNewCustomer((prev) => ({ ...prev, rewardPoints: Number(event.target.value) }))}
              />
            </label>
            <button className="primary-button" type="submit">Create customer</button>
          </form>

          <div className="panel">
            <div className="panel-header">
              <h2>Customers</h2>
              <span>{customers.length} records</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Tier</th>
                    <th>Points</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>
                        <select value={customer.loyaltyTier} onChange={(event) => updateCustomer(customer.id, { loyaltyTier: event.target.value })}>
                          <option>BRONZE</option>
                          <option>SILVER</option>
                          <option>GOLD</option>
                          <option>PLATINUM</option>
                        </select>
                      </td>
                      <td>
                        <input
                          className="inline-input"
                          type="number"
                          value={customer.rewardPoints}
                          onChange={(event) => updateCustomer(customer.id, { rewardPoints: Number(event.target.value) })}
                        />
                      </td>
                      <td>
                        <button className="danger-button" onClick={() => deleteCustomer(customer.id)} title="Delete customer">
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <h2>Orders</h2>
            <span><FiDatabase aria-hidden="true" /> {orders.length} records</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Tracking</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.customerId}</td>
                    <td><span className="tag">{order.status}</span></td>
                    <td>${order.totalAmount}</td>
                    <td>{order.trackingNumber}</td>
                    <td>{order.expectedDelivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPanel;
