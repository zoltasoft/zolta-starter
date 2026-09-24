<?php

declare(strict_types=1);

namespace Tests\Unit\Services\TaskManagerService\Domain;

use App\Services\TaskManagerService\Domain\Aggregates\Task;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\Exceptions\InvalidTaskTransition;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use PHPUnit\Framework\TestCase;

final class TaskTest extends TestCase
{
    public function test_completed_tasks_cannot_return_to_an_active_status(): void
    {
        $task = Task::create(ProjectId::default(), UserId::default(), 'Document the architecture');
        $task->changeStatus(TaskStatus::Done);

        $this->expectException(InvalidTaskTransition::class);
        $task->changeStatus(TaskStatus::InProgress);
    }
}
