<?php

use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\SlideController;
use App\Http\Controllers\Api\CodeExampleController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ─── Health Check ───
Route::get('/health', fn() => response()->json([
    'status'  => 'ok',
    'service' => 'Teaching System API',
    'version' => '1.0.0',
    'time'    => now()->toISOString(),
]));

// ─── Authentication ───
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/my-courses', [CourseController::class, 'myCourses']);
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);
});

// ─── Public Routes ───
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);

// ─── Protected Curriculum Routes (Admin/Teacher only) ───
Route::middleware(['auth:api', 'role:admin,teacher'])->group(function () {
    // Course management
    Route::get('admin/courses', [CourseController::class, 'adminIndex']);
    Route::apiResource('admin/courses', CourseController::class)->except(['index', 'show']);

    // Enrollment management
    Route::get('/admin/enrollments', [CourseController::class, 'allEnrollments']);
    Route::post('/admin/enrollments/{courseId}/{userId}/approve', [CourseController::class, 'approveEnrollment']);
    Route::post('/admin/enrollments/{courseId}/{userId}/reject', [CourseController::class, 'rejectEnrollment']);

    // User management
    Route::post('/users/{user}/enroll', [UserController::class, 'enrollCourse']);
    Route::apiResource('users', UserController::class);

    // Modules reorder
    Route::post('/modules/reorder', [ModuleController::class, 'reorder']);
    Route::get('admin/modules', [ModuleController::class, 'adminIndex']);
    Route::post('/modules/{module}/duplicate', [ModuleController::class, 'duplicate']);
    Route::post('/modules/import', [ModuleController::class, 'import']);
    Route::apiResource('modules', ModuleController::class)->except(['index', 'show']);
    
    // Lessons reorder
    Route::post('/lessons/reorder', [LessonController::class, 'reorder']);
    Route::get('admin/lessons', [LessonController::class, 'adminIndex']);
    Route::post('/lessons/{lesson}/duplicate', [LessonController::class, 'duplicate']);
    Route::apiResource('lessons', LessonController::class)->except(['index', 'show']);
    
    // Slides reorder
    Route::post('/slides/reorder', [SlideController::class, 'reorder']);
    Route::apiResource('slides', SlideController::class)->except(['index', 'show', 'byLesson']);

    // Code Examples
    Route::apiResource('code-examples', CodeExampleController::class)->except(['index', 'show', 'byLesson']);

    // Exercises
    Route::apiResource('exercises', ExerciseController::class)->except(['index', 'show', 'byLesson']);
});

// ─── Protected Student/Curriculum Routes ───
Route::middleware('auth:api')->group(function () {
    Route::get('/modules', [ModuleController::class, 'index']);
    Route::get('/modules/{module}', [ModuleController::class, 'show']);

    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);

    Route::get('/slides/lesson/{lessonId}', [SlideController::class, 'byLesson']);
    Route::get('/slides/{slide}', [SlideController::class, 'show']);

    // ─── Code Examples ───
    Route::get('/code-examples/{lessonId}', [CodeExampleController::class, 'byLesson']);
    Route::get('/code-example/{codeExample}', [CodeExampleController::class, 'show']);

    // ─── Exercises ───
    Route::get('/exercises/{lessonId}', [ExerciseController::class, 'byLesson']);
    Route::get('/exercise/{exercise}', [ExerciseController::class, 'show']);
    Route::get('/exercise/{exercise}/solution', [ExerciseController::class, 'solution']);
});

// ─── Demo API (for teaching REST concepts) ───
Route::prefix('demo')->group(function () {
    Route::get('/users', fn() => response()->json([
        'success' => true,
        'data' => [
            ['id' => 1, 'name' => 'Alice', 'email' => 'alice@example.com', 'role' => 'admin'],
            ['id' => 2, 'name' => 'Bob',   'email' => 'bob@example.com',   'role' => 'student'],
            ['id' => 3, 'name' => 'Carol', 'email' => 'carol@example.com', 'role' => 'student'],
        ]
    ]));

    Route::get('/products', fn() => response()->json([
        'success' => true,
        'data' => [
            ['id' => 1, 'name' => 'Laravel Course',   'price' => 49.99,  'category' => 'programming'],
            ['id' => 2, 'name' => 'Next.js Mastery',  'price' => 39.99,  'category' => 'programming'],
            ['id' => 3, 'name' => 'Docker Basics',    'price' => 29.99,  'category' => 'devops'],
        ]
    ]));

    Route::post('/login', fn() => response()->json([
        'success' => true,
        'token'   => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token',
        'user'    => ['id' => 1, 'name' => 'Teacher', 'role' => 'teacher'],
        'message' => 'Login successful (demo)',
    ]));

    Route::get('/posts', fn() => response()->json([
        'success' => true,
        'data' => [
            ['id' => 1, 'title' => 'What is REST?',        'author' => 'Alice', 'published' => true],
            ['id' => 2, 'title' => 'Laravel API Tutorial', 'author' => 'Bob',   'published' => true],
            ['id' => 3, 'title' => 'Docker for Dev',       'author' => 'Carol', 'published' => false],
        ]
    ]));
});
