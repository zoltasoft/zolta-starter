<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Input;

use Zolta\Support\Application\DTO\Input\InputDTO;

final class ListProjectsDTO extends InputDTO
{
    public function __construct(public readonly string $ownerId) {}
}
