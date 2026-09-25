<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Tasks\DeleteTask;

use App\Services\TaskManagerService\Domain\Exceptions\TaskNotFound;
use App\Services\TaskManagerService\Domain\Repositories\TaskRepository;
use Zolta\Cqrs\Attributes\HandlesCommand;
use Zolta\Cqrs\Services\Result;

#[HandlesCommand(DeleteTaskCommand::class)]
final readonly class DeleteTaskCommandHandler
{
    public function __construct(private TaskRepository $tasks) {}

    public function __invoke(DeleteTaskCommand $command): Result
    {
        if (! $this->tasks->deleteOwned($command->taskId, $command->ownerId)) {
            return Result::failure(new TaskNotFound());
        }

        return Result::success(['taskId' => $command->taskId->toString()]);
    }
}
