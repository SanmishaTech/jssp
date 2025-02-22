<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Staff;
use App\Models\Profile;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         
        $user = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],  
            [
                'name' => 'Admin',
                'password' => Hash::make('abcd123')  
            ]
        );

        // Create or retrieve the admin role
        $role = Role::firstOrCreate(['name' => 'admin']);
        
        // Retrieve all permissions and sync them to the admin role
        $permissions = Permission::pluck('id', 'id')->all();
        $role->syncPermissions($permissions);

        // Assign the role to the user
        $user->syncRoles([$role->id]); // Use syncRoles to avoid duplication
         
        $staff = Staff::where('user_id',$user->id)->first();
         if($staff){
             $staff->email = $user->email;
            $staff->save();
            return;
         }
        $staff = new Staff();
        $staff->user_id = $user->id;
         $staff->email = $user->email;
        $staff->save();

    }
}