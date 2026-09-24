<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Queries\Projects\ListProjects;

use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Queries\Query;

final class ListProjectsQuery extends Query
{
    public function __construct(public readonly UserId $ownerId) {}
}
