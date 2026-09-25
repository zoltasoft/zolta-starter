<?php

declare(strict_types=1);

namespace Tests\Unit\Services\TaskManagerService\Application\Tasks;

use App\Services\TaskManagerService\Application\Commands\Tasks\DeleteTask\DeleteTaskCommand;
use App\Services\TaskManagerService\Application\Commands\Tasks\DeleteTask\DeleteTaskCommandHandler;
use App\Services\TaskManagerService\Domain\Aggregates\Task;
use App\Services\TaskManagerService\Domain\Repositories\TaskRepository;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use PHPUnit\Framework\TestCase;

final class DeleteTaskCommandHandlerTest extends TestCase
{
    public function test_it_deletes_only_the_owned_task(): void
    {
        $repository = new class implements TaskRepository
        {
            public bool $deleted = false;

            public function findOwned(TaskId $id, UserId $ownerId): ?Task { return null; }
            public function deleteOwned(TaskId $id, UserId $ownerId): bool
            {
                $this->deleted = true;
                return true;
            }
            public function save(Task $task): void {}
        };

        $taskId = TaskId::default();
        $result = (new DeleteTaskCommandHandler($repository))(
            new DeleteTaskCommand($taskId, UserId::default())
        )->getOrFail();

        self::assertTrue($repository->deleted);
        self::assertSame($taskId->toString(), $result['taskId']);
    }
}
