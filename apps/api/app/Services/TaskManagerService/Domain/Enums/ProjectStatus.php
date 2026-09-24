<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Enums;

enum ProjectStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
