<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lesson::with('module.courses')->where('is_active', true);

        if ($request->has('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        $lessons = $query->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data'    => $lessons,
            'total'   => $lessons->count(),
        ]);
    }

    /**
     * Admin: Display all lessons (filtered by teacher if applicable)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Lesson::with(['module.courses', 'teacher'])->withCount('slides')->orderBy('order');

        if ($request->user()->role === 'teacher') {
            $user = $request->user();
            $query->where(function($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhereHas('module.courses', function($sq) use ($user) {
                      $sq->where('teacher_id', $user->id);
                  });
            });
        }

        if ($request->has('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        $lessons = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $lessons,
            'total'   => $lessons->count(),
        ]);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        $lesson->load([
            'module.courses',
            'module.lessons' => function($q) {
                $q->where('is_active', true)->orderBy('order');
            },
            'slides', 
            'codeExamples', 
            'exercises'
        ]);

        return response()->json([
            'success' => true,
            'data'    => $lesson,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module_id'   => 'required|exists:modules,id',
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'difficulty'  => 'required|in:beginner,intermediate,advanced',
            'duration'    => 'nullable|string|max:50',
            'order'       => 'nullable|integer',
            'is_active'   => 'boolean',
        ]);

        $data = $validated;
        $data['teacher_id'] = $request->user()->id;

        $lesson = Lesson::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Lesson created successfully',
            'data'    => $lesson,
        ], 201);
    }

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'module_id'   => 'sometimes|required|exists:modules,id',
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'difficulty'  => 'sometimes|required|in:beginner,intermediate,advanced',
            'duration'    => 'nullable|string|max:50',
            'order'       => 'nullable|integer',
            'is_active'   => 'boolean',
        ]);

        $lesson->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lesson updated successfully',
            'data'    => $lesson,
        ]);
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $lesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully',
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'ordered_ids'   => 'required|array',
            'ordered_ids.*' => 'integer|exists:lessons,id',
        ]);

        foreach ($request->ordered_ids as $index => $id) {
            Lesson::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    public function duplicate(Lesson $lesson): JsonResponse
    {
        // 1. Shift order of subsequent lessons within the SAME module
        Lesson::where('module_id', $lesson->module_id)
              ->where('order', '>', $lesson->order)
              ->increment('order');

        // 2. Duplicate Lesson
        $newLesson = $lesson->replicate();
        $newLesson->title = $newLesson->title . ' (Copy)';
        $newLesson->order = $lesson->order + 1;
        $newLesson->save();

        // 3. Duplicate Slides
        foreach ($lesson->slides as $slide) {
            $newSlide = $slide->replicate();
            $newSlide->lesson_id = $newLesson->id;
            $newSlide->save();
        }

        // 4. Duplicate Code Examples
        foreach ($lesson->codeExamples as $example) {
            $newExample = $example->replicate();
            $newExample->lesson_id = $newLesson->id;
            $newExample->save();
        }

        // 5. Duplicate Exercises
        foreach ($lesson->exercises as $exercise) {
            $newExercise = $exercise->replicate();
            $newExercise->lesson_id = $newLesson->id;
            $newExercise->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Lesson duplicated successfully',
            'data'    => $newLesson,
        ]);
    }

    public function import(Request $request, Lesson $lesson): JsonResponse
    {
        $request->validate([
            'json_data' => 'required|json',
        ]);

        $data = json_decode($request->json_data, true);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // 1. Update Lesson
            $lesson->update([
                'title'       => $data['title'] ?? $lesson->title,
                'description' => $data['description'] ?? $lesson->description,
                'difficulty'  => $data['difficulty'] ?? $lesson->difficulty,
                'duration'    => $data['duration'] ?? $lesson->duration,
                'is_active'   => $data['is_active'] ?? $lesson->is_active,
            ]);

            // 2. Sync Slides (if provided)
            if (isset($data['slides']) && is_array($data['slides'])) {
                $keepIds = [];
                foreach ($data['slides'] as $index => $sData) {
                    if (isset($sData['id'])) {
                        $slide = \App\Models\Slide::find($sData['id']);
                        if ($slide && $slide->lesson_id == $lesson->id) {
                            $slide->update([
                                'title'          => $sData['title'] ?? $slide->title,
                                'type'           => $sData['type'] ?? $slide->type,
                                'content'        => $sData['content'] ?? $slide->content,
                                'code_snippet'   => $sData['code_snippet'] ?? $slide->code_snippet,
                                'code_theme'     => $sData['code_theme'] ?? $slide->code_theme,
                                'code_position'  => $sData['code_position'] ?? $slide->code_position,
                                'image'          => $sData['image'] ?? $slide->image,
                                'secondary_image'=> $sData['secondary_image'] ?? $slide->secondary_image,
                                'image_position' => $sData['image_position'] ?? $slide->image_position,
                                'image_width'    => $sData['image_width'] ?? $slide->image_width,
                                'secondary_image_position' => $sData['secondary_image_position'] ?? $slide->secondary_image_position,
                                'secondary_image_width'    => $sData['secondary_image_width'] ?? $sData['secondary_image_width'],
                                'layout_type'    => $sData['layout_type'] ?? $slide->layout_type,
                                'language'       => $sData['language'] ?? $slide->language,
                                'order'          => $sData['order'] ?? $index,
                                'notes'          => $sData['notes'] ?? $slide->notes,
                            ]);
                            $keepIds[] = $slide->id;
                        }
                    } else {
                        $newSlide = $lesson->slides()->create([
                            'title'          => $sData['title'],
                            'type'           => $sData['type'] ?? 'concept',
                            'content'        => $sData['content'] ?? '',
                            'code_snippet'   => $sData['code_snippet'] ?? '',
                            'code_theme'     => $sData['code_theme'] ?? 'terminal',
                            'code_position'  => $sData['code_position'] ?? 'right',
                            'image'          => $sData['image'] ?? null,
                            'secondary_image'=> $sData['secondary_image'] ?? null,
                            'image_position' => $sData['image_position'] ?? 'top',
                            'image_width'    => $sData['image_width'] ?? '100',
                            'secondary_image_position' => $sData['secondary_image_position'] ?? 'right',
                            'secondary_image_width'    => $sData['secondary_image_width'] ?? '50',
                            'layout_type'    => $sData['layout_type'] ?? 'standard',
                            'language'       => $sData['language'] ?? 'php',
                            'order'          => $sData['order'] ?? $index,
                            'notes'          => $sData['notes'] ?? null,
                        ]);
                        $keepIds[] = $newSlide->id;
                    }
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lesson updated from JSON successfully',
                'data'    => $lesson->load('slides')
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
