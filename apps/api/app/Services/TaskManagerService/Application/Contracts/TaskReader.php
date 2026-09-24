<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Contracts;

use App\Services\TaskManagerService\Application\Projections\TaskView;
use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;

interface TaskReader
{
    /** @return list<TaskView> */
    public function listOwned(ProjectId $projectId, UserId $ownerId, ?TaskStatus $status = null, ?TaskPriority $priority = null, ?string $search = null): array;
}
