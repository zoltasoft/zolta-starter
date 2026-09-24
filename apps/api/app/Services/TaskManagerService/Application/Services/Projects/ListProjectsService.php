<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Services\Projects;

use App\Services\TaskManagerService\Application\DTOs\Input\ListProjectsDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\ProjectCollectionResponseDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\ProjectResponseDTO;
use App\Services\TaskManagerService\Application\Queries\Projects\ListProjects\ListProjectsQuery;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Services\Pipeline\ApplicationService;
use Zolta\Support\Application\Attributes\AsApplicationService;

#[AsApplicationService]
final readonly class ListProjectsService
{
    public function __construct(private ApplicationService $applicationService) {}
    public function __invoke(ListProjectsDTO $input): ProjectCollectionResponseDTO
    {
        ['projects' => $projects] = $this->applicationService->runAndCapture(ListProjectsQuery::class, ['ownerId' => UserId::fromString($input->ownerId)])->getOrFail();
        return new ProjectCollectionResponseDTO(array_map(static fn ($project): ProjectResponseDTO => ProjectResponseDTO::fromView($project), $projects));
    }
}
