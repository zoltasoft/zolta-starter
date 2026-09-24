<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Queries\Tasks\ListProjectTasks;

use App\Services\TaskManagerService\Application\Contracts\ProjectReader;
use App\Services\TaskManagerService\Application\Contracts\TaskReader;
use App\Services\TaskManagerService\Domain\Exceptions\ProjectNotFound;
use Zolta\Cqrs\Attributes\HandlesQuery;
use Zolta\Cqrs\Services\Option;

#[HandlesQuery(ListProjectTasksQuery::class)]
final readonly class ListProjectTasksQueryHandler
{
    public function __construct(private ProjectReader $projects, private TaskReader $tasks) {}
    public function __invoke(ListProjectTasksQuery $query): Option
    {
        $project = $this->projects->findOwnedView($query->projectId, $query->ownerId);
        if ($project === null) return Option::error(new ProjectNotFound());
        return Option::some([
            'project' => $project,
            'tasks' => $this->tasks->listOwned($query->projectId, $query->ownerId, $query->status, $query->priority, $query->search),
        ]);
    }
}
