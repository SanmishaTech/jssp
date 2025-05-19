<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or retrieve the cashier role
        $role = Role::firstOrCreate(['name' => 'admission']);     

        // Assign all permissions to the cashier role
        $permissions = Permission::pluck('id', 'id')->all();
        $role->syncPermissions($permissions);
    }
}

