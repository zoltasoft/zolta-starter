<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Queries\Tasks\ListProjectTasks;

use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Queries\Query;

final class ListProjectTasksQuery extends Query
{
    public function __construct(
        public readonly ProjectId $projectId,
        public readonly UserId $ownerId,
        public readonly ?TaskStatus $status = null,
        public readonly ?TaskPriority $priority = null,
        public readonly ?string $search = null,
    ) {}
}
