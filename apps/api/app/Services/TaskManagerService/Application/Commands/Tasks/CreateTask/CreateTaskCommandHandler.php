<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Tasks\CreateTask;

use App\Services\TaskManagerService\Domain\Aggregates\Task;
use App\Services\TaskManagerService\Domain\Exceptions\ProjectNotFound;
use App\Services\TaskManagerService\Domain\Repositories\ProjectRepository;
use App\Services\TaskManagerService\Domain\Repositories\TaskRepository;
use Zolta\Cqrs\Attributes\HandlesCommand;
use Zolta\Cqrs\Services\Result;

#[HandlesCommand(CreateTaskCommand::class)]
final readonly class CreateTaskCommandHandler
{
    public function __construct(private ProjectRepository $projects, private TaskRepository $tasks) {}
    public function __invoke(CreateTaskCommand $command): Result
    {
        if ($this->projects->findOwned($command->projectId, $command->ownerId) === null) return Result::failure(new ProjectNotFound());
        $task = Task::create($command->projectId, $command->ownerId, $command->title, $command->description, $command->priority);
        $this->tasks->save($task);
        return Result::success(['task' => $task]);
    }
}
