<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Providers;

use App\Services\TaskManagerService\Application\Contracts\ProjectReader;
use App\Services\TaskManagerService\Application\Contracts\TaskReader;
use App\Services\TaskManagerService\Domain\Repositories\ProjectRepository;
use App\Services\TaskManagerService\Domain\Repositories\TaskRepository;
use App\Services\TaskManagerService\Infrastructure\Repositories\EloquentProjectRepository;
use App\Services\TaskManagerService\Infrastructure\Repositories\EloquentTaskRepository;
use Illuminate\Support\ServiceProvider;

final class TaskManagerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProjectRepository::class, EloquentProjectRepository::class);
        $this->app->bind(ProjectReader::class, EloquentProjectRepository::class);
        $this->app->bind(TaskRepository::class, EloquentTaskRepository::class);
        $this->app->bind(TaskReader::class, EloquentTaskRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Persistence/Migrations');
    }
}
