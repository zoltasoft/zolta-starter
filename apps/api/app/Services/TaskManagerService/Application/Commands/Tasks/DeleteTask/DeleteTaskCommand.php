<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Tasks\DeleteTask;

use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Commands\Command;

final class DeleteTaskCommand extends Command
{
    public function __construct(public readonly TaskId $taskId, public readonly UserId $ownerId) {}
}
