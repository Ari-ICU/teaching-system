<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Lesson;
use App\Models\Slide;
use App\Models\CodeExample;
use App\Models\Exercise;
use Illuminate\Database\Seeder;

class TeachingSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Fetch Courses ───
        $fullstack = \App\Models\Course::where('slug', 'full-stack-development')->first();
        $frontend = \App\Models\Course::where('slug', 'frontend-specialist')->first();
        $backend = \App\Models\Course::where('slug', 'backend-engineering')->first();

        // ─── Module 1: HTML Basics ───
        $m1 = Module::create([
            'course_id'   => $fullstack?->id,
            'title'       => 'HTML Basics',
            'description' => 'Learn the building blocks of the web',
            'icon'        => '🌐',
            'color'       => '#f97316',
            'order'       => 1,
        ]);

        $l1 = Lesson::create([
            'module_id'   => $m1->id,
            'title'       => 'Introduction to HTML',
            'description' => 'What is HTML and how browsers render it',
            'order'       => 1,
            'duration'    => '45 min',
            'difficulty'  => 'beginner',
        ]);

        Slide::create(['lesson_id' => $l1->id, 'title' => 'What is HTML?', 'type' => 'slide', 'order' => 1, 'content' => "# What is HTML?\n\nHTML (**HyperText Markup Language**) is the standard language for creating web pages.\n\n- **H**yper**T**ext — links between pages\n- **M**arkup — tags that annotate content\n- **L**anguage — a defined syntax\n\n> Every website you visit is built with HTML at its core."]);
        Slide::create(['lesson_id' => $l1->id, 'title' => 'HTML Structure', 'type' => 'code', 'language' => 'html', 'order' => 2, 'content' => "# Basic HTML Document\n\nEvery HTML file follows this structure:\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>\n```"]);
        Slide::create(['lesson_id' => $l1->id, 'title' => 'Common Tags', 'type' => 'slide', 'order' => 3, 'content' => "# Common HTML Tags\n\n| Tag | Purpose |\n|-----|--------|\n| `<h1>` - `<h6>` | Headings |\n| `<p>` | Paragraph |\n| `<a>` | Link |\n| `<img>` | Image |\n| `<div>` | Container |\n| `<span>` | Inline container |\n| `<ul>` / `<li>` | List |"]);

        CodeExample::create(['lesson_id' => $l1->id, 'title' => 'Hello World HTML', 'language' => 'html', 'runnable' => true, 'order' => 1, 'code' => "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Hello World</title>\n</head>\n<body>\n  <h1>Hello, World! 👋</h1>\n  <p>Welcome to HTML basics.</p>\n  <a href=\"#\">Click me!</a>\n</body>\n</html>"]);

        Exercise::create(['lesson_id' => $l1->id, 'title' => 'Build Your First Page', 'question' => 'Create an HTML page with: a heading with your name, a paragraph about yourself, and an unordered list of 3 hobbies.', 'difficulty' => 'easy', 'language' => 'html', 'order' => 1,
            'starter_code' => "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>About Me</title>\n</head>\n<body>\n  <!-- Add your content here -->\n\n</body>\n</html>",
            'solution' => "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>About Me</title>\n</head>\n<body>\n  <h1>John Doe</h1>\n  <p>I am a student learning web development.</p>\n  <ul>\n    <li>Coding</li>\n    <li>Reading</li>\n    <li>Gaming</li>\n  </ul>\n</body>\n</html>",
        ]);

        // ─── Module 2: CSS ───
        $m2 = Module::create([
            'course_id'   => $frontend?->id,
            'title'       => 'CSS Styling',
            'description' => 'Style your pages with CSS',
            'icon'        => '🎨',
            'color'       => '#8b5cf6',
            'order'       => 2,
        ]);

        $l2 = Lesson::create([
            'module_id'   => $m2->id,
            'title'       => 'CSS Fundamentals',
            'description' => 'Selectors, properties, and the box model',
            'order'       => 1,
            'duration'    => '60 min',
            'difficulty'  => 'beginner',
        ]);

        Slide::create(['lesson_id' => $l2->id, 'title' => 'What is CSS?', 'type' => 'slide', 'order' => 1, 'content' => "# What is CSS?\n\n**CSS** (Cascading Style Sheets) controls the **look and feel** of HTML elements.\n\n```css\n/* Selector { property: value; } */\nh1 {\n  color: #6366f1;\n  font-size: 2rem;\n  font-family: 'Inter', sans-serif;\n}\n```\n\n- **Selector** → Which element\n- **Property** → What to change\n- **Value** → How to change it"]);
        Slide::create(['lesson_id' => $l2->id, 'title' => 'The Box Model', 'type' => 'slide', 'order' => 2, 'content' => "# The Box Model\n\nEvery element is a box:\n\n```\n┌─────────────────────────────┐\n│           MARGIN            │\n│  ┌───────────────────────┐  │\n│  │        BORDER         │  │\n│  │  ┌─────────────────┐  │  │\n│  │  │    PADDING      │  │  │\n│  │  │  ┌───────────┐  │  │  │\n│  │  │  │  CONTENT  │  │  │  │\n│  │  │  └───────────┘  │  │  │\n│  │  └─────────────────┘  │  │\n│  └───────────────────────┘  │\n└─────────────────────────────┘\n```"]);

        CodeExample::create(['lesson_id' => $l2->id, 'title' => 'CSS Card Component', 'language' => 'html', 'runnable' => true, 'order' => 1, 'code' => "<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: sans-serif; background: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }\n  .card { background: white; border-radius: 12px; padding: 24px; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }\n  .card h2 { color: #6366f1; margin: 0 0 8px; }\n  .card p { color: #64748b; line-height: 1.6; }\n  .tag { display: inline-block; background: #ede9fe; color: #6366f1; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-top: 12px; }\n</style>\n</head>\n<body>\n  <div class=\"card\">\n    <h2>CSS Card</h2>\n    <p>This card uses CSS box model, shadows, and border-radius.</p>\n    <span class=\"tag\">CSS Basics</span>\n  </div>\n</body>\n</html>"]);

        // ─── Module 3: JavaScript ───
        $m3 = Module::create([
            'course_id'   => $fullstack?->id,
            'title'       => 'JavaScript',
            'description' => 'Make pages interactive with JavaScript',
            'icon'        => '⚡',
            'color'       => '#eab308',
            'order'       => 3,
        ]);

        $l3 = Lesson::create([
            'module_id'   => $m3->id,
            'title'       => 'JavaScript Fundamentals',
            'description' => 'Variables, functions, and DOM manipulation',
            'order'       => 1,
            'duration'    => '90 min',
            'difficulty'  => 'intermediate',
        ]);

        Slide::create(['lesson_id' => $l3->id, 'title' => 'Variables & Types', 'type' => 'code', 'language' => 'javascript', 'order' => 1, 'content' => "# JavaScript Variables\n\n```javascript\n// Modern JS uses let and const\nconst name = 'Alice';       // string — never changes\nlet age = 25;               // number — can change\nlet isStudent = true;       // boolean\nlet data = null;            // null\n\n// Arrays\nconst fruits = ['apple', 'banana', 'cherry'];\n\n// Objects\nconst user = {\n  name: 'Alice',\n  age: 25,\n  role: 'student'\n};\n\nconsole.log(user.name); // 'Alice'\n```"]);
        Slide::create(['lesson_id' => $l3->id, 'title' => 'DOM Manipulation', 'type' => 'code', 'language' => 'javascript', 'order' => 2, 'content' => "# DOM Manipulation\n\n```javascript\n// Select elements\nconst heading = document.getElementById('title');\nconst buttons = document.querySelectorAll('.btn');\n\n// Change content\nheading.textContent = 'New Title!';\nheading.style.color = '#6366f1';\n\n// Add event listener\ndocument.getElementById('myBtn').addEventListener('click', () => {\n  alert('Button clicked!');\n});\n\n// Create new element\nconst li = document.createElement('li');\nli.textContent = 'New item';\ndocument.getElementById('myList').appendChild(li);\n```"]);

        Exercise::create(['lesson_id' => $l3->id, 'title' => 'Counter App', 'question' => 'Build a counter that has + and - buttons. Clicking + increases the count, - decreases it. The count should be displayed on the page.', 'difficulty' => 'easy', 'language' => 'html', 'order' => 1,
            'starter_code' => "<!DOCTYPE html>\n<html>\n<body>\n  <h1 id=\"count\">0</h1>\n  <button id=\"decrease\">-</button>\n  <button id=\"increase\">+</button>\n\n  <script>\n    let count = 0;\n    // Your code here\n  </script>\n</body>\n</html>",
            'solution' => "<!DOCTYPE html>\n<html>\n<body>\n  <h1 id=\"count\">0</h1>\n  <button id=\"decrease\">-</button>\n  <button id=\"increase\">+</button>\n\n  <script>\n    let count = 0;\n    const display = document.getElementById('count');\n    document.getElementById('increase').addEventListener('click', () => {\n      count++;\n      display.textContent = count;\n    });\n    document.getElementById('decrease').addEventListener('click', () => {\n      count--;\n      display.textContent = count;\n    });\n  </script>\n</body>\n</html>",
        ]);

        // ─── Module 4: Next.js ───
        $m4 = Module::create([
            'course_id'   => $frontend?->id,
            'title'       => 'Next.js',
            'description' => 'React framework for production apps',
            'icon'        => '🔺',
            'color'       => '#06b6d4',
            'order'       => 4,
        ]);

        $l4 = Lesson::create([
            'module_id'   => $m4->id,
            'title'       => 'Next.js App Router',
            'description' => 'Routing, pages, and components in Next.js 14',
            'order'       => 1,
            'duration'    => '75 min',
            'difficulty'  => 'intermediate',
        ]);

        Slide::create(['lesson_id' => $l4->id, 'title' => 'What is Next.js?', 'type' => 'slide', 'order' => 1, 'content' => "# What is Next.js?\n\nNext.js is a **React framework** that adds:\n\n- ✅ **File-based routing** — folders = routes\n- ✅ **Server Components** — render on server\n- ✅ **API Routes** — backend in same project\n- ✅ **Automatic optimization** — images, fonts, code splitting\n- ✅ **SEO friendly** — SSR + SSG\n\n> Used by Netflix, TikTok, Twitch, and more."]);
        Slide::create(['lesson_id' => $l4->id, 'title' => 'File-Based Routing', 'type' => 'code', 'language' => 'bash', 'order' => 2, 'content' => "# App Router Structure\n\n```\napp/\n├── page.tsx           → /\n├── about/\n│   └── page.tsx       → /about\n├── blog/\n│   ├── page.tsx       → /blog\n│   └── [id]/\n│       └── page.tsx   → /blog/123\n└── api/\n    └── users/\n        └── route.ts   → GET /api/users\n```\n\nEach `page.tsx` = one route. That's it! 🎉"]);

        // ─── Module 5: Laravel API ───
        $m5 = Module::create([
            'course_id'   => $backend?->id,
            'title'       => 'Laravel API',
            'description' => 'Build REST APIs with Laravel 11',
            'icon'        => '🔴',
            'color'       => '#ef4444',
            'order'       => 5,
        ]);

        $l5 = Lesson::create([
            'module_id'   => $m5->id,
            'title'       => 'REST API with Laravel',
            'description' => 'Routes, controllers, and JSON responses',
            'order'       => 1,
            'duration'    => '90 min',
            'difficulty'  => 'intermediate',
        ]);

        Slide::create(['lesson_id' => $l5->id, 'title' => 'What is REST?', 'type' => 'slide', 'order' => 1, 'content' => "# What is a REST API?\n\n**REST** = Representational State Transfer\n\n| Method | Action | Example |\n|--------|--------|---------|\n| GET    | Read   | `GET /api/users` |\n| POST   | Create | `POST /api/users` |\n| PUT    | Update | `PUT /api/users/1` |\n| DELETE | Remove | `DELETE /api/users/1` |\n\n> APIs let your frontend and backend **talk to each other** using JSON."]);
        Slide::create(['lesson_id' => $l5->id, 'title' => 'Laravel Route → Controller', 'type' => 'code', 'language' => 'php', 'order' => 2, 'content' => "# Laravel API Route Example\n\n```php\n// routes/api.php\nRoute::get('/users', [UserController::class, 'index']);\nRoute::post('/users', [UserController::class, 'store']);\nRoute::get('/users/{user}', [UserController::class, 'show']);\n\n// app/Http/Controllers/UserController.php\npublic function index(): JsonResponse\n{\n    \$users = User::all();\n    return response()->json([\n        'success' => true,\n        'data'    => \$users,\n    ]);\n}\n```"]);

        Exercise::create(['lesson_id' => $l5->id, 'title' => 'Fetch the Demo API', 'question' => 'Use the Live API Tester to call GET /api/demo/users. What fields does each user have? Then call POST /api/demo/login and examine the response.', 'difficulty' => 'easy', 'language' => 'javascript', 'order' => 1,
            'starter_code' => "// Use the API Tester panel on the right →\n// Or test with fetch:\n\nfetch('http://localhost/api/demo/users')\n  .then(res => res.json())\n  .then(data => console.log(data));",
            'solution' => "// GET /api/demo/users returns:\n// { success: true, data: [ {id, name, email, role} ] }\n\n// POST /api/demo/login returns:\n// { success: true, token: '...', user: {id, name, role} }\n\nfetch('http://localhost/api/demo/users')\n  .then(res => res.json())\n  .then(({ data }) => {\n    data.forEach(user => console.log(user.name, '-', user.role));\n  });",
        ]);

        $this->command->info('✅ Teaching data seeded successfully!');
    }
}
