<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Input;

use Zolta\Support\Application\DTO\Input\InputDTO;

final class CreateProjectDTO extends InputDTO
{
    public function __construct(public readonly string $ownerId, public readonly string $name, public readonly string $key, public readonly ?string $description = null) {}
}
