"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  LogOut, 
  User,
  Settings,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  isImpersonating?: boolean;
  impersonatedOrg?: {
    name: string;
    id: string;
  };
  onSwitchBack?: () => void;
}

export function Navbar({ isImpersonating, impersonatedOrg, onSwitchBack }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useState(() => {
    setMounted(true);
  });

  if (!mounted) return null;

  return (
    <>
      {/* Impersonation Banner */}
      {isImpersonating && impersonatedOrg && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-amber-500 text-amber-900 px-4 py-2 text-sm font-medium flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>
              🔒 Impersonating: <strong>{impersonatedOrg.name}</strong> (orgId: {impersonatedOrg.id})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchBack}
            className="text-amber-900 hover:bg-amber-400/20"
          >
            Switch Back to Admin
          </Button>
        </motion.div>
      )}

      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SaaS Admin
                </span>
              </motion.div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">Superuser</p>
                  <p className="text-xs text-muted-foreground">admin@company.com</p>
                </div>
              </div>

              {/* Logout */}
              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}