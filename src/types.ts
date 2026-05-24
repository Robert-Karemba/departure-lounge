export type Category = 'loss' | 'love' | 'adventure' | 'family' | 'work' | 'other';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  body: string;
  category: Category;
  authorId: string;
  authorUsername: string;
  createdAt: string;
  excerpt: string;
  read_time: number;
  ai_selected: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Chapter {
  id: string;
  title: string;
  category: string;
  page_start: number;
  page_end: number;
  storyId: string;
}

export interface Volume {
  id: string;
  title: string;
  volumeNumber: number;
  year: number;
  chapters: Chapter[];
}

export interface AdminStats {
  pending_stories: number;
  approved_stories: number;
  ai_selected_stories: number;
  rejected_stories: number;
}
