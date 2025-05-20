<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\AdmissionSeeder;
use Database\Seeders\AccountantSeeder;
use Database\Seeders\BackOfficeSeeder;
use Database\Seeders\TeachingStaffSeeder;
use Database\Seeders\CreateAdminUserSeeder;
use Database\Seeders\CreateMemberUserSeeder;
use Database\Seeders\NonTeachingStaffSeeder;
use Database\Seeders\CreateCashierRoleSeeder;
use Database\Seeders\CreateSuperAdminUserSeeder;

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
        $this->call(AdmissionSeeder::class);
        $this->call(AccountantSeeder::class);
        $this->call(BackOfficeSeeder::class);
        $this->call(TeachingStaffSeeder::class);
        $this->call(NonTeachingStaffSeeder::class);

    }
}