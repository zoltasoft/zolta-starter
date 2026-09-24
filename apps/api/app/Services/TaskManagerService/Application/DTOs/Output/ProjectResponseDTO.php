<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Output;

use App\Services\TaskManagerService\Application\Projections\ProjectView;
use App\Services\TaskManagerService\Domain\Aggregates\Project;
use Zolta\Support\Application\DTO\Output\ResponseDTO;

final class ProjectResponseDTO extends ResponseDTO
{
    public function __construct(public readonly string $id, public readonly string $owner_id, public readonly string $name, public readonly string $key, public readonly ?string $description, public readonly string $status, public readonly int $tasks_count = 0) {}
    public static function fromDomain(Project $project, int $tasksCount = 0): self { return new self($project->id()->toString(), $project->ownerId()->toString(), $project->name(), $project->key(), $project->description(), $project->status()->value, $tasksCount); }
    public static function fromView(ProjectView $view): self { return new self($view->id, $view->ownerId, $view->name, $view->key, $view->description, $view->status, $view->tasksCount); }
}
