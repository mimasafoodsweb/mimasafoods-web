import { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CartConfig {
  id: string;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export default function CartConfigSettings() {
  const [configs, setConfigs] = useState<CartConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<CartConfig | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('cart_config')
        .select('*')
        .order('name');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching cart configs:', error);
      setError('Failed to load cart configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (config: CartConfig) => {
    setEditingConfig(config);
    setFormData({ name: config.name, value: config.value });
    setIsAddingNew(false);
    setError(null);
    setSuccess(null);
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    setFormData({ name: '', value: '' });
    setIsAddingNew(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setIsAddingNew(false);
    setFormData({ name: '', value: '' });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!formData.name.trim() || !formData.value.trim()) {
        setError('Name and value are required');
        return;
      }

      setError(null);
      setSuccess(null);

      if (isAddingNew) {
        // Create new config
        const { error } = await supabase
          .from('cart_config')
          .insert({
            name: formData.name.trim(),
            value: formData.value.trim()
          });

        if (error) throw error;
        setSuccess('Configuration added successfully');
      } else if (editingConfig) {
        // Update existing config - only update value, not name
        const { error } = await supabase
          .from('cart_config')
          .update({
            value: formData.value.trim()
          })
          .eq('id', editingConfig.id);

        if (error) throw error;
        setSuccess('Configuration updated successfully');
      }

      await fetchConfigs();
      handleCancel();
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Failed to save configuration');
    }
  };

  const getConfigDisplayName = (name: string) => {
    const displayNames: { [key: string]: string } = {
      'shipping': 'Shipping Charge (₹)',
      'free_shipping': 'Free Shipping Threshold (₹)',
    };
    return displayNames[name] || name;
  };

  const getConfigDescription = (name: string) => {
    const descriptions: { [key: string]: string } = {
      'shipping': 'Amount charged for shipping when order is below free shipping threshold',
      'free_shipping': 'Minimum order amount required to qualify for free shipping',
    };
    return descriptions[name] || 'Custom configuration parameter';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mimasa-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-mimasa-deep">Cart Configuration Settings</h2>
          <p className="text-gray-600 mt-1">Manage shipping charges and free shipping thresholds</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-mimasa-primary text-white px-4 py-2 rounded-lg hover:bg-mimasa-primary/90 transition"
        >
          <Plus size={20} />
          Add Configuration
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {(isAddingNew || editingConfig) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-mimasa-deep mb-4">
            {isAddingNew ? 'Add New Configuration' : 'Edit Configuration'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuration Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mimasa-primary focus:border-transparent"
                placeholder="e.g., shipping, free_shipping"
                disabled={!isAddingNew} // Don't allow editing name for existing configs
              />
              {!isAddingNew && (
                <p className="text-xs text-gray-500 mt-1">Configuration names cannot be changed after creation</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuration Value
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mimasa-primary focus:border-transparent"
                placeholder="e.g., 5, 500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getConfigDescription(formData.name)}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-mimasa-primary text-white px-4 py-2 rounded-lg hover:bg-mimasa-primary/90 transition"
              >
                <Save size={18} />
                {isAddingNew ? 'Add Configuration' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Configuration</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Value</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Description</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Last Updated</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {getConfigDisplayName(config.name)}
                    </div>
                    <div className="text-sm text-gray-500">{config.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {config.name.includes('shipping') ? `₹${config.value}` : config.value}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {getConfigDescription(config.name)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {new Date(config.updated_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-mimasa-primary hover:text-mimasa-primary/80 transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {configs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No configurations found. Click "Add Configuration" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
