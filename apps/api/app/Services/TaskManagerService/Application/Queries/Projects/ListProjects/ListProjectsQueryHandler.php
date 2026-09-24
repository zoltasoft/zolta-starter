<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Queries\Projects\ListProjects;

use App\Services\TaskManagerService\Application\Contracts\ProjectReader;
use Zolta\Cqrs\Attributes\HandlesQuery;
use Zolta\Cqrs\Services\Option;

#[HandlesQuery(ListProjectsQuery::class)]
final readonly class ListProjectsQueryHandler
{
    public function __construct(private ProjectReader $projects) {}
    public function __invoke(ListProjectsQuery $query): Option { return Option::some(['projects' => $this->projects->listOwned($query->ownerId)]); }
}
