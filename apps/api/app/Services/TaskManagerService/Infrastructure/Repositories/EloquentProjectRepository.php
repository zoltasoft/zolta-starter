<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Repositories;

use App\Services\TaskManagerService\Application\Contracts\ProjectReader;
use App\Services\TaskManagerService\Application\Projections\ProjectView;
use App\Services\TaskManagerService\Domain\Aggregates\Project;
use App\Services\TaskManagerService\Domain\Repositories\ProjectRepository;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use App\Services\TaskManagerService\Infrastructure\Mappers\ProjectMapper;
use App\Services\TaskManagerService\Infrastructure\Models\ProjectRecord;

final class EloquentProjectRepository implements ProjectRepository, ProjectReader
{
    public function findOwned(ProjectId $id, UserId $ownerId): ?Project
    {
        $record = ProjectRecord::query()->whereKey($id->toString())->where('owner_id', $ownerId->toString())->first();
        return $record === null ? null : ProjectMapper::toDomain($record);
    }
    public function save(Project $project): void
    {
        $record = ProjectRecord::query()->firstOrNew(['id' => $project->id()->toString()]);
        $record->fill(ProjectMapper::attributes($project));
        $record->save();
    }
    public function listOwned(UserId $ownerId): array
    {
        return ProjectRecord::query()->where('owner_id', $ownerId->toString())->withCount('tasks')->latest()->get()->map(ProjectMapper::toView(...))->all();
    }
    public function findOwnedView(ProjectId $projectId, UserId $ownerId): ?ProjectView
    {
        $record = ProjectRecord::query()->whereKey($projectId->toString())->where('owner_id', $ownerId->toString())->withCount('tasks')->first();
        return $record === null ? null : ProjectMapper::toView($record);
    }
}
