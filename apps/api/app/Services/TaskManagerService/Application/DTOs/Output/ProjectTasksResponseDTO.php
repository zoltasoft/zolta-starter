<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Output;

use Zolta\Support\Application\DTO\Output\ResponseDTO;

final class ProjectTasksResponseDTO extends ResponseDTO
{
    /** @param list<TaskResponseDTO> $tasks */
    public function __construct(public readonly ProjectResponseDTO $project, public readonly array $tasks) {}
    public function toArray(): array { return ['project' => $this->project->toArray(), 'tasks' => array_map(static fn (TaskResponseDTO $task): array => $task->toArray(), $this->tasks)]; }
}
