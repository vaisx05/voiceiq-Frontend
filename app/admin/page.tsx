"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Shield } from 'lucide-react';
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { AddOrganizationForm } from '@/components/add-organization-form';
import { OrganizationCard } from '@/components/organization-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Organization {
  id: string;
  name: string;
  domain: string;
  emailDomain: string;
  logo?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

// Mock data - replace with API calls
const mockOrganizations: Organization[] = [
  {
    id: 'org_1',
    name: 'Acme Corporation',
    domain: 'acme.com',
    emailDomain: '@acme.com',
    logo: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 'org_2',
    name: 'TechFlow Solutions',
    domain: 'techflow.io',
    emailDomain: '@techflow.io',
    createdAt: '2024-01-20T14:30:00Z',
    status: 'active'
  },
  {
    id: 'org_3',
    name: 'Global Dynamics',
    domain: 'globaldynamics.com',
    emailDomain: '@globaldynamics.com',
    createdAt: '2024-01-25T09:15:00Z',
    status: 'suspended'
  }
];

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [impersonatedOrg, setImpersonatedOrg] = useState<Organization | null>(null);

  const handleAddOrganization = (newOrg: Omit<Organization, 'id' | 'createdAt'>) => {
    const organization: Organization = {
      ...newOrg,
      id: `org_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setOrganizations([organization, ...organizations]);
  };

  const handleLoginAs = (org: Organization) => {
    setImpersonatedOrg(org);
    // In a real app, you would redirect to the organization's dashboard
    console.log('Impersonating organization:', org);
  };

  const handleSwitchBack = () => {
    setImpersonatedOrg(null);
  };

  const stats = [
    {
      title: 'Total Organizations',
      value: organizations.length,
      icon: Building2,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Active Organizations',
      value: organizations.filter(org => org.status === 'active').length,
      icon: TrendingUp,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Total Users',
      value: '2,547',
      icon: Users,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Security Events',
      value: '12',
      icon: Shield,
      color: 'from-orange-600 to-orange-700'
    }
  ];

  return (
    <DashboardShell>
      <DashboardHeader
        heading={impersonatedOrg ? `${impersonatedOrg.name} Dashboard` : 'Admin Dashboard'}
        text={
          impersonatedOrg
            ? `Managing ${impersonatedOrg.name} organization`
            : 'Manage organizations and monitor platform activity'
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!impersonatedOrg && (
          <>
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Add Organization Form */}
            <AddOrganizationForm onAddOrganization={handleAddOrganization} />

            {/* Organizations Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Organizations ({organizations.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org, index) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <OrganizationCard
                      organization={org}
                      onLoginAs={handleLoginAs}
                    />
                  </motion.div>
                ))}
              </div>

              {organizations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No organizations yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create your first organization to get started.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        {/* Impersonated Organization Content */}
        {impersonatedOrg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                    <p className="text-lg font-semibold">{impersonatedOrg.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Domain</label>
                    <p className="text-lg font-semibold">{impersonatedOrg.domain}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Organization ID</label>
                    <p className="text-lg font-mono">{impersonatedOrg.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-lg font-semibold capitalize">{impersonatedOrg.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Organization dashboard content would appear here</p>
              <p className="text-sm">This is where the organization-specific features and data would be displayed</p>
            </div>
          </motion.div>
        )}
      </main>
    </DashboardShell>
  );
}