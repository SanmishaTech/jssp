<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CreateCashierRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or retrieve the cashier role
        $role = Role::firstOrCreate(['name' => 'cashier']);     

        // Assign all permissions to the cashier role
        $permissions = Permission::pluck('id', 'id')->all();
        $role->syncPermissions($permissions);
    }
}
