<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Repositories;

use App\Services\TaskManagerService\Application\Contracts\TaskReader;
use App\Services\TaskManagerService\Domain\Aggregates\Task;
use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\Repositories\TaskRepository;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use App\Services\TaskManagerService\Infrastructure\Mappers\TaskMapper;
use App\Services\TaskManagerService\Infrastructure\Models\TaskRecord;

final class EloquentTaskRepository implements TaskRepository, TaskReader
{
    public function findOwned(TaskId $id, UserId $ownerId): ?Task
    {
        $record = TaskRecord::query()->whereKey($id->toString())->where('owner_id', $ownerId->toString())->first();
        return $record === null ? null : TaskMapper::toDomain($record);
    }
    public function deleteOwned(TaskId $id, UserId $ownerId): bool
    {
        return TaskRecord::query()->whereKey($id->toString())->where('owner_id', $ownerId->toString())->delete() > 0;
    }
    public function save(Task $task): void
    {
        $record = TaskRecord::query()->firstOrNew(['id' => $task->id()->toString()]);
        $record->fill(TaskMapper::attributes($task));
        $record->save();
    }
    public function listOwned(ProjectId $projectId, UserId $ownerId, ?TaskStatus $status = null, ?TaskPriority $priority = null, ?string $search = null): array
    {
        $query = TaskRecord::query()->where('project_id', $projectId->toString())->where('owner_id', $ownerId->toString());
        if ($status !== null) $query->where('status', $status->value);
        if ($priority !== null) $query->where('priority', $priority->value);
        if ($search !== null && trim($search) !== '') $query->where('title', 'like', '%'.trim($search).'%');
        return $query->latest()->get()->map(TaskMapper::toView(...))->all();
    }
}
