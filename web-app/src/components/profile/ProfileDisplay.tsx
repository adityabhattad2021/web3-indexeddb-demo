'use client';
/**
 * Profile Display Component
 * 
 * This component shows user profile information with cached data support.
 * It demonstrates how cached blockchain data can be displayed efficiently.
 */


import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useUserProfile } from '@/hooks/useContract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Database } from 'lucide-react';
import { ProfileData } from '@/lib/indexeddb/config';
import { formatDistanceToNow } from 'date-fns';

interface ProfileDisplayProps {
  userAddress?: string;
}

export function ProfileDisplay({ userAddress }: ProfileDisplayProps) {
  const { address: connectedAddress } = useAccount();
  const { getUserProfile } = useUserProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  const address = userAddress || connectedAddress;

  useEffect(() => {
    const loadProfile = async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const profileData = await getUserProfile(address);
        setProfile(profileData);
        
        // Check if data is from cache (less than 5 minutes old)
        if (profileData && (Date.now() - profileData.lastUpdated) < 5 * 60 * 1000) {
          setFromCache(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [address, getUserProfile]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-12 w-12"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !profile.exists) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {address === connectedAddress ? 'You haven\'t created a profile yet' : 'User profile not found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{profile.username}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
              </p>
            </div>
          </div>
          
          {fromCache && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Cached
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {profile.bio && (
          <div>
            <h4 className="font-medium mb-2">Bio</h4>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDistanceToNow(new Date(profile.lastUpdated), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}