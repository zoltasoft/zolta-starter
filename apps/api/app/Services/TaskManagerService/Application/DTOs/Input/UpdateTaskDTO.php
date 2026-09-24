<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Input;

use Zolta\Support\Application\DTO\Input\InputDTO;

final class UpdateTaskDTO extends InputDTO
{
    public function __construct(public readonly string $taskId, public readonly string $ownerId, public readonly ?string $title = null, public readonly ?string $description = null, public readonly ?string $status = null, public readonly ?string $priority = null) {}
}
