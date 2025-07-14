"use client";

import { motion } from 'framer-motion';
import { Calendar, Building2, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Organization {
  id: string;
  name: string;
  domain: string;
  emailDomain: string;
  logo?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

interface OrganizationCardProps {
  organization: Organization;
  onLoginAs: (org: Organization) => void;
}

export function OrganizationCard({ organization, onLoginAs }: OrganizationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'suspended':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={`${organization.name} logo`}
                  className="h-12 w-12 rounded-lg object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                  {organization.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {organization.domain}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(organization.status)}>
              {organization.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">ID:</span>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {organization.id}
              </code>
            </div>
            
            {organization.emailDomain && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Email:</span>
                <span className="text-xs">{organization.emailDomain}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">
                Created {new Date(organization.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            onClick={() => onLoginAs(organization)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg transition-all"
            disabled={organization.status === 'suspended'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Login as {organization.name}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}