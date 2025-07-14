"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Building2, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Organization {
  id: string;
  name: string;
  domain: string;
  emailDomain: string;
  logo?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

interface AddOrganizationFormProps {
  onAddOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => void;
}

export function AddOrganizationForm({ onAddOrganization }: AddOrganizationFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    emailDomain: '',
    logo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.domain) return;

    onAddOrganization({
      name: formData.name,
      domain: formData.domain,
      emailDomain: formData.emailDomain,
      logo: formData.logo,
      status: 'active'
    });

    // Reset form
    setFormData({ name: '', domain: '', emailDomain: '', logo: '' });
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          onClick={() => setIsExpanded(true)}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Organization
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-8"
    >
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Add New Organization
          </CardTitle>
          <CardDescription>
            Create a new organization to manage users and access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <Label htmlFor="domain" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain *
                </Label>
                <Input
                  id="domain"
                  placeholder="acme.com"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  required
                />
              </div>

              {/* Email Domain */}
              <div className="space-y-2">
                <Label htmlFor="emailDomain" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Domain/Tag
                </Label>
                <Input
                  id="emailDomain"
                  placeholder="@acme.com"
                  value={formData.emailDomain}
                  onChange={(e) => setFormData({ ...formData, emailDomain: e.target.value })}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Logo URL (Optional)
                </Label>
                <Input
                  id="logo"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Create Organization
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}