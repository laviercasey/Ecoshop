<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating roles...');

        foreach (UserRole::cases() as $role) {
            Role::firstOrCreate(['name' => $role->value]);
        }

        $password = config('seeder.default_password');

        $this->command->info('Creating staff users...');

        $admin = User::firstOrCreate(
            ['email' => 'admin@ecoshop.ru'],
            [
                'name' => 'Администратор',
                'phone' => '+7 (495) 100-00-01',
                'password' => $password,
            ]
        );
        $admin->assignRole(UserRole::Admin->value);

        $manager = User::firstOrCreate(
            ['email' => 'manager@ecoshop.ru'],
            [
                'name' => 'Менеджер заказов',
                'phone' => '+7 (495) 100-00-02',
                'password' => $password,
            ]
        );
        $manager->assignRole(UserRole::OrderManager->value);

        $contentManager = User::firstOrCreate(
            ['email' => 'content@ecoshop.ru'],
            [
                'name' => 'Контент-менеджер',
                'phone' => '+7 (495) 100-00-03',
                'password' => $password,
            ]
        );
        $contentManager->assignRole(UserRole::ContentManager->value);

        $this->command->info('Creating customer users...');

        $customers = [
            ['name' => 'Иванов Алексей Петрович', 'email' => 'ivanov@example.com', 'phone' => '+7 (916) 234-56-78'],
            ['name' => 'Петрова Мария Сергеевна', 'email' => 'petrova@example.com', 'phone' => '+7 (925) 345-67-89'],
            ['name' => 'Сидоров Дмитрий Андреевич', 'email' => 'sidorov@example.com', 'phone' => '+7 (903) 456-78-90'],
            ['name' => 'Козлова Елена Владимировна', 'email' => 'kozlova@example.com', 'phone' => '+7 (917) 567-89-01'],
            ['name' => 'Новиков Артём Игоревич', 'email' => 'novikov@example.com', 'phone' => '+7 (926) 678-90-12'],
        ];

        foreach ($customers as $data) {
            $customer = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => $password,
                ]
            );
            $customer->assignRole(UserRole::Customer->value);
        }

        $this->command->info('Users seeded: '.User::count().' total');
    }
}
