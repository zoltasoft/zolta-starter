<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Services\Tasks;

use App\Services\TaskManagerService\Application\Commands\Tasks\DeleteTask\DeleteTaskCommand;
use App\Services\TaskManagerService\Application\DTOs\Input\DeleteTaskDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\DeleteTaskResponseDTO;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Services\Pipeline\ApplicationService;
use Zolta\Support\Application\Attributes\AsApplicationService;

#[AsApplicationService]
final readonly class DeleteTaskService
{
    public function __construct(private ApplicationService $applicationService) {}

    public function __invoke(DeleteTaskDTO $input): DeleteTaskResponseDTO
    {
        ['taskId' => $taskId] = $this->applicationService->runAndCapture(DeleteTaskCommand::class, [
            'taskId' => TaskId::fromString($input->taskId),
            'ownerId' => UserId::fromString($input->ownerId),
        ])->getOrFail();

        return new DeleteTaskResponseDTO(true, $taskId);
    }
}
