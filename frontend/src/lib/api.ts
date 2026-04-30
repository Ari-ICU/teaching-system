import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string;
  order: number;
  duration: string;
  difficulty: string;
  module?: Module;
}

export interface Slide {
  id: number;
  lesson_id: number;
  title: string;
  content: string;
  type: 'slide' | 'code' | 'demo' | 'exercise';
  language?: string;
  order: number;
}

export interface CodeExample {
  id: number;
  lesson_id: number;
  title: string;
  code: string;
  language: string;
  description?: string;
  runnable: boolean;
  order: number;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  title: string;
  question: string;
  starter_code?: string;
  language: string;
  difficulty: string;
  hint?: string;
  order: number;
}

export default api;
