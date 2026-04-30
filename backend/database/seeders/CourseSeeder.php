<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Full-stack Development',
                'description' => 'Master both frontend and backend technologies to build complete web applications from scratch.',
                'order' => 1
            ],
            [
                'title' => 'Frontend Specialist',
                'description' => 'Focus on building beautiful, responsive, and interactive user interfaces using modern CSS and React.',
                'order' => 2
            ],
            [
                'title' => 'Backend Engineering',
                'description' => 'Dive deep into server-side logic, database architecture, and API design with PHP and Laravel.',
                'order' => 3
            ]
        ];

        foreach ($courses as $course) {
            Course::updateOrCreate(
                ['slug' => Str::slug($course['title'])],
                [
                    'title' => $course['title'],
                    'description' => $course['description'],
                    'order' => $course['order'],
                    'is_active' => true
                ]
            );
        }
    }
}
