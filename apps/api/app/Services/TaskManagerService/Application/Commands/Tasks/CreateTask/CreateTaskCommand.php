<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Tasks\CreateTask;

use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Commands\Command;

final class CreateTaskCommand extends Command
{
    public function __construct(public readonly ProjectId $projectId, public readonly UserId $ownerId, public readonly string $title, public readonly ?string $description = null, public readonly TaskPriority $priority = TaskPriority::Medium) {}
}
