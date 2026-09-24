<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Input;

use Zolta\Support\Application\DTO\Input\InputDTO;

final class ListProjectTasksDTO extends InputDTO
{
    public function __construct(
        public readonly string $projectId,
        public readonly string $ownerId,
        public readonly ?string $status = null,
        public readonly ?string $priority = null,
        public readonly ?string $search = null,
    ) {}
}
