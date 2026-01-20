import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setOrganization } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateName = (value: string): string => {
    if (!value.trim()) {
      return 'Organization name is required';
    }
    if (value.trim().length < 3) {
      return 'Organization name must be at least 3 characters';
    }
    if (value.trim().length > 50) {
      return 'Organization name must be less than 50 characters';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.createOrganization(name.trim());
      setOrganization(response.organization_id, name.trim());
      addToast('success', 'Organization created successfully!');
      navigate('/upload');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Build Your AI Knowledge Base
          </h1>
          <p className="text-gray-600">
            Create an organization to get started with your AI-powered support
            engine
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Organization Name"
              type="text"
              placeholder="Enter your organization name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              error={error}
              autoFocus
            />

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Create Organization
            </Button>
          </form>
        </Card>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          After registration, you'll be able to upload documents and start
          chatting with your AI assistant
        </p>
      </div>
    </div>
  );
};

export default Register;
