<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Services\Tasks;

use App\Services\TaskManagerService\Application\Commands\Tasks\CreateTask\CreateTaskCommand;
use App\Services\TaskManagerService\Application\DTOs\Input\CreateTaskDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\TaskResponseDTO;
use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Services\Pipeline\ApplicationService;
use Zolta\Support\Application\Attributes\AsApplicationService;

#[AsApplicationService]
final readonly class CreateTaskService
{
    public function __construct(private ApplicationService $applicationService) {}
    public function __invoke(CreateTaskDTO $input): TaskResponseDTO
    {
        ['task' => $task] = $this->applicationService->runAndCapture(CreateTaskCommand::class, ['projectId' => ProjectId::fromString($input->projectId), 'ownerId' => UserId::fromString($input->ownerId), 'title' => $input->title, 'description' => $input->description, 'priority' => TaskPriority::from($input->priority)])->getOrFail();
        return TaskResponseDTO::fromDomain($task);
    }
}
