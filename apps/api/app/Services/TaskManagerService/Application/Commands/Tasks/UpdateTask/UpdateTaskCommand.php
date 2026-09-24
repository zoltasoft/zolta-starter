<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Tasks\UpdateTask;

use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Commands\Command;

final class UpdateTaskCommand extends Command
{
    public function __construct(public readonly TaskId $taskId, public readonly UserId $ownerId, public readonly ?string $title = null, public readonly ?string $description = null, public readonly ?TaskStatus $status = null, public readonly ?TaskPriority $priority = null) {}
}
