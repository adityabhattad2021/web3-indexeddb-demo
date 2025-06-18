'use client';
/**
 * Profile Creation Component
 * 
 * This component handles the creation of user profiles on the blockchain.
 * It includes form validation and integrates with both the smart contract
 * and IndexedDB caching system.
 */


import { useState } from 'react';
import { useUserProfile } from '@/hooks/useContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileCreation() {
	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');
	const { createProfile, isCreatingProfile, error, isConfirmed } = useUserProfile();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!username.trim()) {
			toast.error('Username is required');
			return;
		}

		const success = await createProfile(username.trim(), bio.trim());

		if (success) {
			toast.success('Profile creation transaction submitted! 🎉');
			setUsername('');
			setBio('');
		} else {
			toast.error(error || 'Failed to create profile');
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="text-center">
				<CardTitle className="flex items-center justify-center gap-2">
					<UserPlus className="h-5 w-5" />
					Create Your Profile
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					Set up your profile on the blockchain
				</p>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={isCreatingProfile}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bio">Bio (Optional)</Label>
						<Textarea
							id="bio"
							placeholder="Tell us about yourself..."
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							disabled={isCreatingProfile}
							rows={3}
						/>
					</div>

					{error && (
						<div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
							<p className="text-sm text-red-800 dark:text-red-200">
								{error}
							</p>
						</div>
					)}

					{isConfirmed && (
						<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
							<div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
								<CheckCircle className="h-4 w-4" />
								Profile created successfully on blockchain!
							</div>
						</div>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={isCreatingProfile || !username.trim()}
					>
						{isCreatingProfile ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								{isConfirmed ? 'Confirmed!' : 'Creating Profile...'}
							</>
						) : (
							<>
								<UserPlus className="h-4 w-4 mr-2" />
								Create Profile
							</>
						)}
					</Button>

					{isCreatingProfile && !isConfirmed && (
						<p className="text-xs text-muted-foreground text-center">
							Please confirm the transaction in your wallet and wait for blockchain confirmation...
						</p>
					)}
				</form>
			</CardContent>
		</Card>
	);
}