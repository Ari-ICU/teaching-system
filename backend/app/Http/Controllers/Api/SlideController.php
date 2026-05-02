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
            'secondary_image'=> 'nullable|image|max:2048',
            'image_position' => 'nullable|string|in:top,bottom,left,right',
            'image_width'             => 'nullable|string',
            'secondary_image_position'=> 'nullable|string|in:top,bottom,left,right',
            'secondary_image_width'   => 'nullable|string',
            'code_position'           => 'nullable|string|in:bottom,right',
            'code_theme'     => 'nullable|string|in:terminal,browser,editor',
            'layout_type'    => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('slides', 'public');
            $validated['image'] = $path;
        }

        if ($request->hasFile('secondary_image')) {
            $path = $request->file('secondary_image')->store('slides', 'public');
            $validated['secondary_image'] = $path;
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
            'secondary_image'=> 'nullable|image|max:2048',
            'image_position' => 'nullable|string|in:top,bottom,left,right',
            'image_width'             => 'nullable|string',
            'secondary_image_position'=> 'nullable|string|in:top,bottom,left,right',
            'secondary_image_width'   => 'nullable|string',
            'code_position'           => 'nullable|string|in:bottom,right',
            'code_theme'     => 'nullable|string|in:terminal,browser,editor',
            'layout_type'    => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($slide->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($slide->image);
            }
            $path = $request->file('image')->store('slides', 'public');
            $validated['image'] = $path;
        }

        if ($request->hasFile('secondary_image')) {
            // Delete old image if exists
            if ($slide->secondary_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($slide->secondary_image);
            }
            $path = $request->file('secondary_image')->store('slides', 'public');
            $validated['secondary_image'] = $path;
        }

        // Handle removals
        if ($request->boolean('remove_image')) {
            if ($slide->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($slide->image);
            }
            $validated['image'] = null;
        }

        if ($request->boolean('remove_secondary_image')) {
            if ($slide->secondary_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($slide->secondary_image);
            }
            $validated['secondary_image'] = null;
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

    public function duplicate(Slide $slide): JsonResponse
    {
        $newSlide = $slide->replicate();
        $newSlide->title = $newSlide->title . ' (Copy)';
        $newSlide->order = $slide->order + 1;
        $newSlide->save();

        // Shift others' order
        Slide::where('lesson_id', $slide->lesson_id)
            ->where('id', '!=', $newSlide->id)
            ->where('order', '>=', $newSlide->order)
            ->increment('order');

        return response()->json([
            'success' => true,
            'message' => 'Slide duplicated successfully',
            'data'    => $newSlide,
        ]);
    }
}
