<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Repositories;

use App\Services\TaskManagerService\Domain\Aggregates\Project;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;

interface ProjectRepository
{
    public function findOwned(ProjectId $id, UserId $ownerId): ?Project;
    public function save(Project $project): void;
}
