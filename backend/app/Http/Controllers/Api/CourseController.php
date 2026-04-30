<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    /**
     * Display a listing of all active courses.
     */
    public function index(Request $request)
    {
        $query = Course::where('is_active', true)
            ->with(['modules' => function($q) {
                $q->where('is_active', true)->orderBy('modules.order');
            }])
            ->withCount('modules')
            ->orderBy('order');

        $user = auth('api')->user();
        if ($user && $user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        }

        return response()->json([
            'data' => $query->get()
        ]);
    }

    /**
     * Admin: Display all courses (filtered by teacher if applicable)
     */
    public function adminIndex(Request $request)
    {
        $query = Course::withCount('modules')->orderBy('order');
        
        if ($request->user()->role === 'teacher') {
            $query->where('teacher_id', $request->user()->id);
        }

        return response()->json([
            'data' => $query->get()
        ]);
    }

    /**
     * Display the specified course with its modules.
     */
    public function show($idOrSlug)
    {
        $query = Course::where('slug', $idOrSlug);

        // PostgreSQL fix: only query 'id' if the input is numeric
        if (is_numeric($idOrSlug)) {
            $query->orWhere('id', $idOrSlug);
        }

        $course = $query->with(['modules.lessons'])
            ->firstOrFail();

        return response()->json([
            'data' => $course
        ]);
    }

    /**
     * Get courses enrolled by the current user.
     */
    public function myCourses(Request $request)
    {
        $query = $request->user()->courses();
        
        // If not admin, only show active courses
        if ($request->user()->role === 'student') {
            $query->wherePivot('status', 'active');
        }

        return response()->json([
            'data' => $query->with(['modules' => function($q) {
                $q->where('is_active', true)->orderBy('order');
            }])->withCount('modules')->get()
        ]);
    }

    /**
     * Admin: Store a new course.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'integer',
            'teacher_id' => 'nullable|exists:users,id',
            'image' => 'nullable|image|max:2048' // 2MB max
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('courses', 'public');
        }

        $course = Course::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'description' => $request->description,
            'image' => $imagePath,
            'order' => $request->order ?? 0,
            'is_active' => true,
            'teacher_id' => $request->teacher_id ?? $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Course created successfully',
            'data' => $course
        ], 201);
    }

    /**
     * Admin: Update a course.
     */
    public function update(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'teacher_id' => 'nullable|exists:users,id',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('image');
        
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('courses', 'public');
        }

        $course->update($data);
        if ($request->has('title')) {
            $course->slug = Str::slug($request->title);
            $course->save();
        }

        return response()->json([
            'message' => 'Course updated successfully',
            'data' => $course
        ]);
    }

    /**
     * Enroll the current user in a course with payment verification.
     */
    public function enroll(Request $request, Course $course)
    {
        $request->validate([
            'phone' => 'required|string',
            'payment_screenshot' => 'required|image|max:5120', // 5MB max
        ]);

        $user = $request->user();
        
        // Check if already enrolled (including pending)
        if ($user->courses()->where('course_id', $course->id)->exists()) {
            return response()->json([
                'message' => 'You already have an active or pending enrollment for this course.'
            ], 422);
        }

        $path = $request->file('payment_screenshot')->store('payments', 'public');

        $user->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'status' => 'pending',
            'phone' => $request->phone,
            'payment_screenshot' => $path,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Enrollment request submitted! We will verify your invoice soon.',
            'data' => $course
        ]);
    }

    /**
     * Admin: List all pending enrollments.
     */
    public function allEnrollments(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get all course_user records where status is pending
        // We'll use a direct DB query or a raw join for simplicity in this pivot-heavy area
        $enrollments = \DB::table('course_user')
            ->join('users', 'course_user.user_id', '=', 'users.id')
            ->join('courses', 'course_user.course_id', '=', 'courses.id')
            ->select('course_user.*', 'users.name as user_name', 'users.email as user_email', 'courses.title as course_title')
            ->where('course_user.status', 'pending')
            ->orderBy('course_user.created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $enrollments
        ]);
    }

    /**
     * Admin: Approve an enrollment.
     */
    public function approveEnrollment(Request $request, $courseId, $userId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        \DB::table('course_user')
            ->where('course_id', $courseId)
            ->where('user_id', $userId)
            ->update([
                'status' => 'active',
                'updated_at' => now()
            ]);

        return response()->json(['message' => 'Enrollment approved successfully!']);
    }

    /**
     * Admin: Reject an enrollment.
     */
    public function rejectEnrollment(Request $request, $courseId, $userId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        \DB::table('course_user')
            ->where('course_id', $courseId)
            ->where('user_id', $userId)
            ->update([
                'status' => 'rejected',
                'admin_note' => $request->note,
                'updated_at' => now()
            ]);

        return response()->json(['message' => 'Enrollment rejected.']);
    }

    /**
     * Admin: Delete a course.
     */
    public function destroy(Course $course)
    {
        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }
}
