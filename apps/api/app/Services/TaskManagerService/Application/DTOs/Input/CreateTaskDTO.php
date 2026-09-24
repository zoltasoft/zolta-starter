<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Input;

use Zolta\Support\Application\DTO\Input\InputDTO;

final class CreateTaskDTO extends InputDTO
{
    public function __construct(public readonly string $projectId, public readonly string $ownerId, public readonly string $title, public readonly ?string $description = null, public readonly string $priority = 'medium') {}
}
