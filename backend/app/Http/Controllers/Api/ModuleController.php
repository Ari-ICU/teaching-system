<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('api')->user();
        $query = Module::with(['lessons' => function ($q) {
            $q->where('is_active', true)->orderBy('order');
        }])->withCount('lessons')->where('is_active', true);

        // If student, only show modules from their enrolled courses
        if ($user && $user->role === 'student') {
            $courseIds = $user->courses()->pluck('courses.id');
            $query->whereIn('course_id', $courseIds);
        }

        // If teacher, only show their modules or modules belonging to their courses
        if ($user && $user->role === 'teacher') {
            $query->where(function($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhereHas('courses', function($sq) use ($user) {
                      $sq->where('teacher_id', $user->id);
                  });
            });
        }

        $modules = $query->with('courses')->orderBy('order')->get();
        
        // Append course title for legacy UI
        $modules->map(function($m) {
            $m->course_title = $m->courses->first()?->title ?? 'No Course';
            return $m;
        });

        return response()->json([
            'success' => true,
            'data'    => $modules,
            'total'   => $modules->count(),
        ]);
    }

    /**
     * Admin: Display all modules (filtered by teacher if applicable)
     */
    public function adminIndex(\Illuminate\Http\Request $request): JsonResponse
    {
        $query = Module::with('courses')->withCount('lessons')->orderBy('order');
        
        if ($request->user()->role === 'teacher') {
            $user = $request->user();
            $query->where(function($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhereHas('courses', function($sq) use ($user) {
                      $sq->where('teacher_id', $user->id);
                  });
            });
        }

        $modules = $query->get();
        
        // Append course title for legacy UI
        $modules->map(function($m) {
            $m->course_title = $m->courses->first()?->title ?? 'No Course';
            return $m;
        });

        return response()->json([
            'success' => true,
            'data'    => $modules,
            'total'   => $modules->count(),
        ]);
    }

    public function show(Module $module): JsonResponse
    {
        $user = auth('api')->user();

        // Security check for students
        if ($user && $user->role === 'student') {
            $enrolled = $user->courses()
                             ->where('courses.id', $module->course_id)
                             ->exists();
            
            if (!$enrolled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. You are not enrolled in the course containing this module.'
                ], 403);
            }
        }

        $module->load([
            'courses',
            'lessons.slides', 
            'lessons.codeExamples', 
            'lessons.exercises'
        ]);

        return response()->json([
            'success' => true,
            'data'    => $module,
        ]);
    }

    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'icon'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:50',
            'order'       => 'nullable|integer',
            'course_ids'  => 'required|array',
            'course_ids.*' => 'exists:courses,id',
            'is_active'   => 'boolean',
            'image'       => 'nullable|image|max:2048'
        ]);

        $data = $request->only(['title', 'description', 'icon', 'color', 'order', 'is_active']);
        
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('modules', 'public');
        }

        $data['teacher_id'] = $request->user()->id;
        $module = Module::create($data);
        
        if ($request->has('course_ids')) {
            $module->courses()->sync($request->course_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'Module created successfully',
            'data'    => $module->load('courses'),
        ], 201);
    }

    public function update(\Illuminate\Http\Request $request, Module $module): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'icon'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:50',
            'order'       => 'nullable|integer',
            'course_ids'  => 'nullable|array',
            'course_ids.*' => 'exists:courses,id',
            'is_active'   => 'boolean',
            'image'       => 'nullable|image|max:2048'
        ]);

        $data = $request->only(['title', 'description', 'icon', 'color', 'order', 'is_active']);
        
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('modules', 'public');
        }

        $module->update($data);

        if ($request->has('course_ids')) {
            $module->courses()->sync($request->course_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'Module updated successfully',
            'data'    => $module->load('courses'),
        ]);
    }

    public function destroy(Module $module): JsonResponse
    {
        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Module deleted successfully',
        ]);
    }

    public function reorder(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'ordered_ids'   => 'required|array',
            'ordered_ids.*' => 'integer|exists:modules,id',
        ]);

        foreach ($request->ordered_ids as $index => $id) {
            Module::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    public function duplicate(Module $module): JsonResponse
    {
        // 1. Shift order of other modules
        Module::where('order', '>', $module->order)->increment('order');

        // 2. Duplicate Module
        $newModule = $module->replicate();
        $newModule->title = $newModule->title . ' (Copy)';
        $newModule->order = $module->order + 1; // Place right after original
        $newModule->save();

        // Sync courses
        $newModule->courses()->sync($module->courses->pluck('id'));

        // 3. Duplicate Lessons
        foreach ($module->lessons as $lesson) {
            $newLesson = $lesson->replicate();
            $newLesson->module_id = $newModule->id;
            $newLesson->save();

            // Duplicate Slides
            foreach ($lesson->slides as $slide) {
                $newSlide = $slide->replicate();
                $newSlide->lesson_id = $newLesson->id;
                $newSlide->save();
            }

            // Duplicate Code Examples
            foreach ($lesson->codeExamples as $example) {
                $newExample = $example->replicate();
                $newExample->lesson_id = $newLesson->id;
                $newExample->save();
            }

            // Duplicate Exercises
            foreach ($lesson->exercises as $exercise) {
                $newExercise = $exercise->replicate();
                $newExercise->lesson_id = $newLesson->id;
                $newExercise->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Module duplicated successfully',
            'data'    => $newModule->load('courses'),
        ]);
    }
}
