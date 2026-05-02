<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;

class ExerciseController extends Controller
{
    public function byLesson(int $lessonId): JsonResponse
    {
        $exercises = Exercise::where('lesson_id', $lessonId)->orderBy('order')->get();

        // Hide solution by default (teacher reveals it)
        $exercises->makeHidden(['solution']);

        return response()->json([
            'success' => true,
            'data'    => $exercises,
            'total'   => $exercises->count(),
        ]);
    }

    public function solution(Exercise $exercise): JsonResponse
    {
        return response()->json([
            'success'  => true,
            'solution' => $exercise->solution,
            'hint'     => $exercise->hint,
        ]);
    }

    public function show(Exercise $exercise): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $exercise->makeHidden(['solution']),
        ]);
    }

    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'question' => 'required|string',
            'starter_code' => 'nullable|string',
            'solution' => 'required|string',
            'hint' => 'nullable|string',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'language' => 'required|string',
            'order' => 'integer'
        ]);

        $exercise = Exercise::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Exercise created successfully',
            'data' => $exercise
        ], 201);
    }

    public function update(\Illuminate\Http\Request $request, Exercise $exercise): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'question' => 'sometimes|string',
            'starter_code' => 'nullable|string',
            'solution' => 'sometimes|string',
            'hint' => 'nullable|string',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'language' => 'sometimes|string',
            'order' => 'sometimes|integer'
        ]);

        $exercise->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Exercise updated successfully',
            'data' => $exercise
        ]);
    }

    public function destroy(Exercise $exercise): JsonResponse
    {
        $exercise->delete();

        return response()->json([
            'success' => true,
            'message' => 'Exercise deleted successfully'
        ]);
    }

    public function duplicate(Exercise $exercise): JsonResponse
    {
        $newExercise = $exercise->replicate();
        $newExercise->title = $newExercise->title . ' (Copy)';
        $newExercise->order = $exercise->order + 1;
        $newExercise->save();

        return response()->json([
            'success' => true,
            'message' => 'Exercise duplicated successfully',
            'data'    => $newExercise,
        ]);
    }
}
