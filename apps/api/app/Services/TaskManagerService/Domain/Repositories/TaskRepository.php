<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Repositories;

use App\Services\TaskManagerService\Domain\Aggregates\Task;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;

interface TaskRepository
{
    public function findOwned(TaskId $id, UserId $ownerId): ?Task;
    public function deleteOwned(TaskId $id, UserId $ownerId): bool;
    public function save(Task $task): void;
}
