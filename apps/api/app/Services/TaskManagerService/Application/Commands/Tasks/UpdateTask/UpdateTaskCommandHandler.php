<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Tasks\UpdateTask;

use App\Services\TaskManagerService\Domain\Exceptions\TaskNotFound;
use App\Services\TaskManagerService\Domain\Repositories\TaskRepository;
use Zolta\Cqrs\Attributes\HandlesCommand;
use Zolta\Cqrs\Services\Result;

#[HandlesCommand(UpdateTaskCommand::class)]
final readonly class UpdateTaskCommandHandler
{
    public function __construct(private TaskRepository $tasks) {}
    public function __invoke(UpdateTaskCommand $command): Result
    {
        $task = $this->tasks->findOwned($command->taskId, $command->ownerId);
        if ($task === null) return Result::failure(new TaskNotFound());
        if ($command->title !== null) $task->rename($command->title);
        if ($command->description !== null) $task->changeDescription($command->description);
        if ($command->status !== null) $task->changeStatus($command->status);
        if ($command->priority !== null) $task->changePriority($command->priority);
        $this->tasks->save($task);
        return Result::success(['task' => $task]);
    }
}
