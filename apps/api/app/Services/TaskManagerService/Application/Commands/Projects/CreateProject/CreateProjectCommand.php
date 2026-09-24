<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Commands\Projects\CreateProject;

use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use Zolta\Cqrs\Commands\Command;

final class CreateProjectCommand extends Command
{
    public function __construct(public readonly UserId $ownerId, public readonly string $name, public readonly string $key, public readonly ?string $description = null) {}
}
