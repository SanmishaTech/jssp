<?php

namespace Database\Seeders;

use App\Models\User;
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
         
        $profile = Profile::where('user_id',$user->id)->first();
         if($profile){
            $profile->profile_name = $user->name;
            $profile->email = $user->email;
            $profile->save();
            return;
         }
        $profile = new Profile();
        $profile->user_id = $user->id;
        $profile->profile_name = $user->name;
        $profile->email = $user->email;
        $profile->save();

    }
}