<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Services\Projects;

use App\Services\TaskManagerService\Application\Commands\Projects\CreateProject\CreateProjectCommand;
use App\Services\TaskManagerService\Application\DTOs\Input\CreateProjectDTO;
use App\Services\TaskManagerService\Application\DTOs\Output\ProjectResponseDTO;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Services\Pipeline\ApplicationService;
use Zolta\Support\Application\Attributes\AsApplicationService;

#[AsApplicationService]
final readonly class CreateProjectService
{
    public function __construct(private ApplicationService $applicationService) {}
    public function __invoke(CreateProjectDTO $input): ProjectResponseDTO
    {
        ['project' => $project] = $this->applicationService->runAndCapture(CreateProjectCommand::class, ['ownerId' => UserId::fromString($input->ownerId), 'name' => $input->name, 'key' => $input->key, 'description' => $input->description])->getOrFail();
        return ProjectResponseDTO::fromDomain($project);
    }
}
