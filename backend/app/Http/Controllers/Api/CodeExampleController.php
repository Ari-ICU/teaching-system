<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CodeExample;
use Illuminate\Http\JsonResponse;

class CodeExampleController extends Controller
{
    public function byLesson(int $lessonId): JsonResponse
    {
        $examples = CodeExample::where('lesson_id', $lessonId)->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data'    => $examples,
            'total'   => $examples->count(),
        ]);
    }

    public function show(CodeExample $codeExample): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $codeExample,
        ]);
    }

    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'code' => 'required|string',
            'language' => 'required|string',
            'runnable' => 'boolean',
            'order' => 'integer'
        ]);

        $example = CodeExample::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Code example created successfully',
            'data' => $example
        ], 201);
    }

    public function update(\Illuminate\Http\Request $request, CodeExample $codeExample): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'code' => 'sometimes|string',
            'language' => 'sometimes|string',
            'runnable' => 'sometimes|boolean',
            'order' => 'sometimes|integer'
        ]);

        $codeExample->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Code example updated successfully',
            'data' => $codeExample
        ]);
    }

    public function destroy(CodeExample $codeExample): JsonResponse
    {
        $codeExample->delete();

        return response()->json([
            'success' => true,
            'message' => 'Code example deleted successfully'
        ]);
    }
}
