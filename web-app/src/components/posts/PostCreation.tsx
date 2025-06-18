'use client';
/**
 * Post Creation Component
 * 
 * This component handles the creation of posts on the blockchain.
 * It includes form validation and real-time updates to the cached data.
 */


import { useState } from 'react';
import { usePosts } from '@/hooks/useContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PenTool, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PostCreationProps {
  onPostCreated?: () => void;
}

export function PostCreation({ onPostCreated }: PostCreationProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createPost, isCreatingPost, error, isConfirmed } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    const success = await createPost(title.trim(), content.trim());
    
    if (success) {
      toast.success('Post creation transaction submitted! 🎉');
      setTitle('');
      setContent('');
      onPostCreated?.();
    } else {
      toast.error(error || 'Failed to create post');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Create a New Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="What's your post about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreatingPost}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isCreatingPost}
              rows={4}
              required
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
                Post created successfully on blockchain!
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreatingPost || !title.trim() || !content.trim()}
          >
            {isCreatingPost ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isConfirmed ? 'Confirmed!' : 'Creating Post...'}
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4 mr-2" />
                Create Post
              </>
            )}
          </Button>

          {isCreatingPost && !isConfirmed && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Please confirm the transaction in your wallet and wait for blockchain confirmation...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}