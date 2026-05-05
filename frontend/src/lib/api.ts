import axios from 'axios';

const isServer = typeof window === 'undefined';
const baseURL = isServer 
  ? (process.env.INTERNAL_API_URL || 'http://nginx/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api');

const api = axios.create({
  baseURL,
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
  type: string;
  layout_type?: string;
  image?: string;
  secondary_image?: string;
  image_position?: "top" | "bottom" | "left" | "right";
  image_width?: string;
  secondary_image_position?: "top" | "bottom" | "left" | "right";
  secondary_image_width?: string;
  code_snippet?: string;
  code_position?: "bottom" | "right";
  code_theme?: "terminal" | "browser" | "editor";
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
