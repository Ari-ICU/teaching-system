<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $query = User::latest();
        
        // If teacher, only show students in their courses
        if ($user->role === 'teacher') {
            $courseIds = \App\Models\Course::where('teacher_id', $user->id)->pluck('id');
            $query->where('role', '!=', 'admin')
                  ->whereHas('courses', function($q) use ($courseIds) {
                      $q->whereIn('courses.id', $courseIds);
                  });
        }

        return response()->json([
            'data' => $query->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['student', 'teacher', 'admin'])],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified resource with their courses.
     */
    public function show(User $user)
    {
        $currentUser = auth()->user();
        
        if ($currentUser->role === 'teacher') {
            $isEnrolledInTeacherCourse = $user->courses()
                ->where('teacher_id', $currentUser->id)
                ->exists();
            
            if (!$isEnrolledInTeacherCourse && $user->role !== 'admin') {
                 return response()->json(['message' => 'Unauthorized. This student is not enrolled in any of your courses.'], 403);
            }
        }

        return response()->json([
            'data' => $user->load('courses')
        ]);
    }

    /**
     * Admin: Manually enroll a user in a course.
     */
    public function enrollCourse(Request $request, User $user)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id'
        ]);

        $currentUser = auth()->user();
        if ($currentUser->role === 'teacher') {
            $course = \App\Models\Course::find($request->course_id);
            if ($course->teacher_id !== $currentUser->id) {
                return response()->json(['message' => 'Unauthorized. You can only enroll students in your own courses.'], 403);
            }
        }

        if ($user->courses()->where('course_id', $request->course_id)->exists()) {
            $user->courses()->updateExistingPivot($request->course_id, [
                'status' => 'active',
                'enrolled_at' => now(),
            ]);
        } else {
            $user->courses()->attach($request->course_id, [
                'status' => 'active',
                'enrolled_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'User enrolled successfully!'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'role' => ['sometimes', Rule::in(['student', 'teacher', 'admin'])],
        ]);

        // Prevent teachers from updating admin users or changing roles
        if (auth()->user()->role === 'teacher') {
            if ($user->role === 'admin') {
                return response()->json(['message' => 'Unauthorized. Teachers cannot modify admin accounts.'], 403);
            }
            if ($request->has('role') && $request->role !== $user->role) {
                return response()->json(['message' => 'Unauthorized. Teachers cannot change user roles.'], 403);
            }
            
            // Authorization: Teacher can only edit themselves or their own students
            $isAuthorized = $user->courses()->where('teacher_id', auth()->id())->exists();
            if (!$isAuthorized && $user->id !== auth()->id()) {
                 return response()->json(['message' => 'Unauthorized. You can only edit students enrolled in your courses.'], 403);
            }
        }

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('role')) $user->role = $request->role;
        if ($request->has('password')) $user->password = Hash::make($request->password);

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        // Prevent teachers from deleting admin users
        if (auth()->user()->role === 'teacher' && $user->role === 'admin') {
            return response()->json(['message' => 'Unauthorized. Teachers cannot delete admin accounts.'], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
