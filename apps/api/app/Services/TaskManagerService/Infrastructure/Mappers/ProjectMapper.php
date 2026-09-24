<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Infrastructure\Mappers;

use App\Services\TaskManagerService\Application\Projections\ProjectView;
use App\Services\TaskManagerService\Domain\Aggregates\Project;
use App\Services\TaskManagerService\Domain\Enums\ProjectStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use App\Services\TaskManagerService\Infrastructure\Models\ProjectRecord;

final class ProjectMapper
{
    public static function toDomain(ProjectRecord $record): Project
    {
        return Project::restore(ProjectId::fromString((string) $record->id), UserId::fromString((string) $record->owner_id), (string) $record->name, (string) $record->key, $record->description, ProjectStatus::from((string) $record->status));
    }
    public static function toView(ProjectRecord $record): ProjectView
    {
        return new ProjectView((string) $record->id, (string) $record->owner_id, (string) $record->name, (string) $record->key, $record->description, (string) $record->status, (int) ($record->tasks_count ?? 0));
    }
    public static function attributes(Project $project): array
    {
        return ['id' => $project->id()->toString(), 'owner_id' => $project->ownerId()->toString(), 'name' => $project->name(), 'key' => $project->key(), 'description' => $project->description(), 'status' => $project->status()->value];
    }
}
