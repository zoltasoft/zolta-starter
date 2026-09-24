<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Contracts;

use App\Services\TaskManagerService\Application\Projections\ProjectView;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;

interface ProjectReader
{
    /** @return list<ProjectView> */
    public function listOwned(UserId $ownerId): array;
    public function findOwnedView(ProjectId $projectId, UserId $ownerId): ?ProjectView;
}
