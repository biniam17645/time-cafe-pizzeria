import { BlogPost } from '../types';
import { BLOG_POSTS as INITIAL_POSTS } from '../data/blog';

const STORAGE_KEY = 'time_cafe_blog_posts';

export class BlogStore {
  private static instance: BlogStore;
  private posts: BlogPost[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.load();
  }

  public static getInstance(): BlogStore {
    if (!BlogStore.instance) {
      BlogStore.instance = new BlogStore();
    }
    return BlogStore.instance;
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.posts = JSON.parse(stored);
      } else {
        this.posts = [...INITIAL_POSTS];
        this.save();
      }
    } catch {
      this.posts = [...INITIAL_POSTS];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
    } catch {
      // Storage fallback
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getPosts(): BlogPost[] {
    return [...this.posts];
  }

  public getPostById(id: string): BlogPost | undefined {
    return this.posts.find((p) => p.id === id);
  }

  public addPost(post: Omit<BlogPost, 'id' | 'date'>): BlogPost {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    this.posts.unshift(newPost);
    this.save();
    return newPost;
  }

  public updatePost(id: string, data: Partial<BlogPost>): boolean {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.posts[idx] = { ...this.posts[idx], ...data };
    this.save();
    return true;
  }

  public deletePost(id: string): boolean {
    const prevLen = this.posts.length;
    this.posts = this.posts.filter((p) => p.id !== id);
    if (this.posts.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public resetToDefaults(): void {
    this.posts = [...INITIAL_POSTS];
    this.save();
  }
}

export const blogStore = BlogStore.getInstance();
