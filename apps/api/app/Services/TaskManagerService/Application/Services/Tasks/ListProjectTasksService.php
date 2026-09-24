<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Services\Tasks;

use App\Services\TaskManagerService\Application\DTOs\Input\ListProjectTasksDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\ProjectResponseDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\ProjectTasksResponseDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\TaskResponseDTO;
use App\Services\TaskManagerService\Application\Queries\Tasks\ListProjectTasks\ListProjectTasksQuery;
use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Services\Pipeline\ApplicationService;
use Zolta\Support\Application\Attributes\AsApplicationService;

#[AsApplicationService]
final readonly class ListProjectTasksService
{
    public function __construct(private ApplicationService $applicationService) {}
    public function __invoke(ListProjectTasksDTO $input): ProjectTasksResponseDTO
    {
        ['project' => $project, 'tasks' => $tasks] = $this->applicationService->runAndCapture(ListProjectTasksQuery::class, [
            'projectId' => ProjectId::fromString($input->projectId),
            'ownerId' => UserId::fromString($input->ownerId),
            'status' => $input->status === null ? null : TaskStatus::from($input->status),
            'priority' => $input->priority === null ? null : TaskPriority::from($input->priority),
            'search' => $input->search === null ? null : trim($input->search),
        ])->getOrFail();
        return new ProjectTasksResponseDTO(ProjectResponseDTO::fromView($project), array_map(static fn ($task): TaskResponseDTO => TaskResponseDTO::fromView($task), $tasks));
    }
}
