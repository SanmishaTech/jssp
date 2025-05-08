<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\CreateSuperAdminUserSeeder;
use Database\Seeders\CreateAdminUserSeeder;
use Database\Seeders\CreateMemberUserSeeder;
use Database\Seeders\CreateCashierRoleSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call(CreateSuperAdminUserSeeder::class);
        $this->call(CreateAdminUserSeeder::class);
        $this->call(CreateMemberUserSeeder::class);
        $this->call(CreateCashierRoleSeeder::class);
    }
}