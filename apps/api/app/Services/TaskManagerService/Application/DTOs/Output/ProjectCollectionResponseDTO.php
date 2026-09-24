<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Output;

use Zolta\Support\Application\DTO\Output\ResponseDTO;

final class ProjectCollectionResponseDTO extends ResponseDTO
{
    /** @param list<ProjectResponseDTO> $projects */
    public function __construct(public readonly array $projects) {}
    public function toArray(): array { return ['projects' => array_map(static fn (ProjectResponseDTO $project): array => $project->toArray(), $this->projects)]; }
}
