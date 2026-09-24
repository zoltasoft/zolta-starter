<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Mappers;

use App\Services\TaskManagerService\Application\Projections\TaskView;
use App\Services\TaskManagerService\Domain\Aggregates\Task;
use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use App\Services\TaskManagerService\Infrastructure\Models\TaskRecord;

final class TaskMapper
{
    public static function toDomain(TaskRecord $record): Task
    {
        return Task::restore(TaskId::fromString((string) $record->id), ProjectId::fromString((string) $record->project_id), UserId::fromString((string) $record->owner_id), (string) $record->title, $record->description, TaskStatus::from((string) $record->status), TaskPriority::from((string) $record->priority));
    }
    public static function toView(TaskRecord $record): TaskView
    {
        return new TaskView((string) $record->id, (string) $record->project_id, (string) $record->owner_id, (string) $record->title, $record->description, (string) $record->status, (string) $record->priority);
    }
    public static function attributes(Task $task): array
    {
        return ['id' => $task->id()->toString(), 'project_id' => $task->projectId()->toString(), 'owner_id' => $task->ownerId()->toString(), 'title' => $task->title(), 'description' => $task->description(), 'status' => $task->status()->value, 'priority' => $task->priority()->value];
    }
}
