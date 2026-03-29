<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class CreateAdminCommand extends Command
{
    protected $signature = 'app:create-admin';

    protected $description = 'Create admin user and roles from ADMIN_PASSWORD env variable';

    public function handle(): int
    {
        foreach (UserRole::cases() as $role) {
            Role::firstOrCreate(['name' => $role->value]);
        }

        $password = env('ADMIN_PASSWORD');

        if (! $password) {
            $this->warn('ADMIN_PASSWORD is not set in .env — skipping admin creation.');

            return self::SUCCESS;
        }

        $admin = User::firstOrCreate(
            ['email' => 'admin@ecoshop.ru'],
            [
                'name' => 'Администратор',
                'password' => $password,
            ]
        );

        if ($admin->wasRecentlyCreated) {
            $admin->assignRole(UserRole::Admin->value);
            $this->info('Admin user created: admin@ecoshop.ru');
        } else {
            $this->info('Admin user already exists.');
        }

        return self::SUCCESS;
    }
}
