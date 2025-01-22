<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class CreateSuperAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or retrieve the superadmin user
        $user = User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],  
            [
                'name' => 'Super Admin',
                'password' => Hash::make('abcd123')  
            ]
        );

        // Create or retrieve the superadmin role
        $role = Role::firstOrCreate(['name' => 'superadmin']);
        
        // Retrieve all permissions and assign them to the superadmin role
        $permissions = Permission::all(); // Get all permissions
        $role->syncPermissions($permissions); // Sync all permissions to the role

        // Assign the superadmin role to the user
        $user->syncRoles([$role->id]);

        // Update or create the employee profile
        $profile = Employee::where('user_id', $user->id)->first();
        if ($profile) {
            $profile->employee_name = $user->name;
            $profile->email = $user->email;
            $profile->save();
            return;
        }

        $profile = new Employee();
        $profile->user_id = $user->id;
        $profile->employee_name = $user->name;
        $profile->email = $user->email;
        $profile->save();
    }
}