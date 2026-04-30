<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use Illuminate\Http\JsonResponse;

class SlideController extends Controller
{
    public function byLesson(int $lessonId): JsonResponse
    {
        $slides = Slide::where('lesson_id', $lessonId)->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data'    => $slides,
            'total'   => $slides->count(),
        ]);
    }

    public function show(Slide $slide): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $slide,
        ]);
    }

    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lesson_id'      => 'required|exists:lessons,id',
            'title'          => 'required|string|max:255',
            'content'        => 'required|string',
            'code_snippet'   => 'nullable|string',
            'type'           => 'required|string|max:50',
            'order'          => 'nullable|integer',
            'image'          => 'nullable|image|max:2048',
            'image_position' => 'nullable|string|in:top,bottom,left,right',
            'image_width'    => 'nullable|string',
            'code_position'  => 'nullable|string|in:bottom,right',
            'code_theme'     => 'nullable|string|in:terminal,browser,editor',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('slides', 'public');
            $validated['image'] = $path;
        }

        $slide = Slide::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Slide created successfully',
            'data'    => $slide,
        ], 201);
    }

    public function update(\Illuminate\Http\Request $request, Slide $slide): JsonResponse
    {
        $validated = $request->validate([
            'lesson_id'      => 'sometimes|required|exists:lessons,id',
            'title'          => 'sometimes|required|string|max:255',
            'content'        => 'sometimes|required|string',
            'code_snippet'   => 'nullable|string',
            'type'           => 'sometimes|required|string|max:50',
            'order'          => 'nullable|integer',
            'image'          => 'nullable|image|max:2048',
            'image_position' => 'nullable|string|in:top,bottom,left,right',
            'image_width'    => 'nullable|string',
            'code_position'  => 'nullable|string|in:bottom,right',
            'code_theme'     => 'nullable|string|in:terminal,browser,editor',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($slide->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($slide->image);
            }
            $path = $request->file('image')->store('slides', 'public');
            $validated['image'] = $path;
        }

        $slide->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Slide updated successfully',
            'data'    => $slide,
        ]);
    }

    public function destroy(Slide $slide): JsonResponse
    {
        $slide->delete();

        return response()->json([
            'success' => true,
            'message' => 'Slide deleted successfully',
        ]);
    }

    public function reorder(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'ordered_ids'   => 'required|array',
            'ordered_ids.*' => 'integer|exists:slides,id',
        ]);

        foreach ($request->ordered_ids as $index => $id) {
            Slide::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }
}
