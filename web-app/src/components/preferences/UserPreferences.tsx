'use client';
/**
 * User Preferences Component
 * 
 * This component manages client-side user preferences stored in IndexedDB.
 * It demonstrates how to handle settings that don't need to go on the blockchain.
 */


import { useAccount } from 'wagmi';
import { useUserPreferences } from '@/hooks/useIndexedDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, User } from 'lucide-react';
import { toast } from 'sonner';

export function UserPreferences() {
  const { address } = useAccount();
  const { preferences, updatePreferences, loading } = useUserPreferences(address);

  if (!address) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Connect your wallet to access preferences
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading || !preferences) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    toast.success('Preferences saved! ⚙️');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          User Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These settings are stored locally and don't require blockchain transactions
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (Optional)</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="How others see you"
              value={preferences.displayName || ''}
              onChange={(e) => updatePreferences({ displayName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => updatePreferences({ theme: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cacheTimeout">Cache Timeout (minutes)</Label>
            <Input
              id="cacheTimeout"
              type="number"
              min="1"
              max="60"
              value={preferences.cacheTimeout}
              onChange={(e) => updatePreferences({ cacheTimeout: parseInt(e.target.value) || 15 })}
            />
            <p className="text-xs text-muted-foreground">
              How long to keep blockchain data cached locally
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Enable browser notifications
              </p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={(checked) => updatePreferences({ notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoRefresh">Auto Refresh</Label>
              <p className="text-xs text-muted-foreground">
                Automatically refresh data periodically
              </p>
            </div>
            <Switch
              id="autoRefresh"
              checked={preferences.autoRefresh}
              onCheckedChange={(checked) => updatePreferences({ autoRefresh: checked })}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>

        <div className="pt-2 text-xs text-muted-foreground space-y-1">
          <p>💾 All preferences are stored locally using IndexedDB</p>
          <p>🔒 No blockchain transactions required for these settings</p>
          <p>⚡ Changes are applied immediately</p>
        </div>
      </CardContent>
    </Card>
  );
}