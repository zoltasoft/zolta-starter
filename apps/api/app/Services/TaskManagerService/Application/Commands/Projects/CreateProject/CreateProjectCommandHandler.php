<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Projects\CreateProject;

use App\Services\TaskManagerService\Domain\Aggregates\Project;
use App\Services\TaskManagerService\Domain\Repositories\ProjectRepository;
use Zolta\Cqrs\Attributes\HandlesCommand;
use Zolta\Cqrs\Services\Result;

#[HandlesCommand(CreateProjectCommand::class)]
final readonly class CreateProjectCommandHandler
{
    public function __construct(private ProjectRepository $projects) {}
    public function __invoke(CreateProjectCommand $command): Result
    {
        $project = Project::create($command->ownerId, $command->name, $command->key, $command->description);
        $this->projects->save($project);
        return Result::success(['project' => $project]);
    }
}
