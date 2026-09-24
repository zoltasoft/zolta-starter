<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Services\Tasks;

use App\Services\TaskManagerService\Application\Commands\Tasks\UpdateTask\UpdateTaskCommand;
use App\Services\TaskManagerService\Application\DTOs\Input\UpdateTaskDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\TaskResponseDTO;
use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Services\Pipeline\ApplicationService;
use Zolta\Support\Application\Attributes\AsApplicationService;

#[AsApplicationService]
final readonly class UpdateTaskService
{
    public function __construct(private ApplicationService $applicationService) {}
    public function __invoke(UpdateTaskDTO $input): TaskResponseDTO
    {
        ['task' => $task] = $this->applicationService->runAndCapture(UpdateTaskCommand::class, [
            'taskId' => TaskId::fromString($input->taskId),
            'ownerId' => UserId::fromString($input->ownerId),
            'title' => $input->title,
            'description' => $input->description,
            'status' => $input->status === null ? null : TaskStatus::from($input->status),
            'priority' => $input->priority === null ? null : TaskPriority::from($input->priority),
        ])->getOrFail();
        return TaskResponseDTO::fromDomain($task);
    }
}
