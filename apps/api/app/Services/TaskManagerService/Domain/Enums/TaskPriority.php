<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Enums;

enum TaskPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}
